---
layout: post
category: candcpp
title: 你这个“死”循环
---

# 你这个“死”循环

前面的我们说过，“死”循环。 其实死循环并不死，只是状态感觉机器无法跳出循环，以能处理其他逻辑，有死的感觉,而已。 
鬼话：其实我更把“死”循环的“死”字，如同你这个“死”太监，一样，当作夸张，的意思。学习C语言设计，有很多概念，甚至必要是需亲自动手，而这些工作，其他语言已经帮你做好了。别埋怨C，虽然有时你要多点事情，但也表示你的手段更加灵活和强大。死循环就是其中一个。 

死循环，相对一般循环确实夸张，但夸张点在它的循环不需要判断，不需要初始化，不需要做每次循环的调整。因此，希望你有这个概念，符合上述的条件的死循环，并不死，而是“死”太监的“死”，我们更应该叫它简洁循环。例如 
    for(;;){ } 
其实还有更简单的 
    while (1){ } 
这里引出了另一个循环的书写方式。 
    while (expression) { } 
expression如同if (expression)一样，是个表达式。 是不是有比这个更间接的循环？有，如下 
    while (1); 
不过这我得说一句了，这可是真正的死循环了。 

我们用goto模拟一下while 
{% highlight c %}
LABEL_while: //这是个标号     
    if (expression) { 
        //这里等同while()后的内容。 
        goto LABEL_while;//额外多个再跳转 
    }else{ 
    }
{% endhighlight %}
这就是while的对应。因此 
    while (1); 
等于 
    LABEL_while: 
        if (1) goto LABEL_while; 

和 if 语句可以不加{}一样，如果你只有一行语句，例如 
    while (1) i++;
的语句。其等于 
    LABEL_while: 
        if (1) { 
            i++; 
            goto LABEL_while;     
        } 
而对应continue和break在while的作用如下
{% highlight c %}
while (1){
    if (flag){
        continue;
    } else {
        break;
    }
    i++;
}
{% endhighlight %}
等同于
{% highlight c %}
LABEL_while:
    if (1){
        if (flag){
            goto LABEL_while;//continue
        } else {
            goto LABEL_end;//break;
        }
        i++;
        goto LABEL_while;
    }
LABEL_end:
{% endhighlight %}

是否记得，我说了，死循环并没有错，错在由于死循环中取法完整的或 必要的逻辑，导致死循环没有终结。因此死循环关注于我们的退出条件。 

如果一个while(1)的循环体（即{}内），放眼望去，没有break; return ;goto ,或其他诸如longjmp的内容，那么一定(通常）存在逻辑缺失。即便你真的打算让这个循环不需要停止或退出。 扩展一下，一定的意思是确实其调用函数内部没有longjmp，其代码片的#define中没有上述内容。这也得说，切记切记，宏的#define是不错。但不要把会对代码有分支选择动作的语句放在宏定义了。这样增加了代码的阅读困难。 

这里扩展一个本不该在本部分中介绍的内容。sleep();函数。你可以在参考文献3 21.6中找到他的原型。如下： 
    unsigned int sleep(unsigned int seconds); 
而我从网上摘抄了一个微软VC标准库提供的sleep函数原型。 
    void   Sleep(DWORD dwMilliseconds); 
注意是大写。不仅名称不一样，参数的含义也不一样。而你在参考文献1中是找不到sleep的函数原型，即该函数不是C标准。因此，通常谈标准库，严格时，是说国际标准所列出来的函数组成的库。而放送的说，是编译器提供的支持C国际标准以及其他标准的例如posix的库。 

很明显，有些代码，一旦你尝试将GCC下编译能通过的代码放到VC下编译，或者intel 提供的C/C++编译工具处理，会出现代码无法正确编译的错误。 

解决方式先不介绍，你首先要学习的是，保持良好习惯。如果对一个新学习的库函数的使用准备了解时，首先要确认这个函数和编译器相关还是不相关。 

sleep函数用来做什么 ？很简单，是用来睡觉的。让谁睡觉？让当前的进程睡觉。当前的进程是什么？废话，你写的代码，在执行的时候总要处于某个进程，而该进程的执行内容也即你的代码对应的指令。 

先不说，怎么使用，先说说为什要睡觉。因为条件不成熟。通常的一种解释是因为你死循环不能一直跑啊。咱着OS可高级了。是多进程的。你死跑死跑，还让不让别的进程活了？但即便如单片机那样，只有你一个进程在运行，你还是要睡觉。 

睡觉不是一个动作，是一个态度。试想，如果一个程序，和外部没有交流，那么就是一条道走到黑的主。会有两个情况，干完你所交代的事情，立刻结束。通常大学里都这么教。没有死循环。即便有循环，计算需要10天半个月的，但不好意思，这10天半个月，你也和它无法交互，除非枪毙。这属于过把瘾就死的态度。而另一种，就属于，他来了，但不走了，这属于雕像派。虽然一直伫立在那看似有模有样的，但你和他打招呼他也不搭理你。 

而睡觉，是一种什么态度呢？服务的态度。我做，我等，我服务。例如我们将attr.c的main函数修改如下： 

{% highlight c %}
#include <stdio.h>
#include <string.h>
#include <unistd.h>

#include "view.h"
#include "control.h"
#include "model.h"
int g_status = 0;
int main(int argc ,char *argv[]){

    FILE *f = 0;
    int view_mode = 0;
    int control_mode = 0;

    if (argc < 2){
        printf("please enter the pathname !\n");
        return 1;
    }
    control_mode = ((f = fopen(argv[1],"rt")) != 0);
    if (control_mode){
        strcpy(filename,argv[1]);
        fclose(f);
        view_mode = 0;
    }else{
        filename[0] = 0;
        view_mode = 1;
        strcpy(v_param,argv[1]);
    }
    g_status = 1;
    while (1){
        if (g_status == 0){
            break;
        }else {
            control(control_mode);
            model(0);
            view(view_mode);
            g_status = 0;
        }
        sleep(1);
    }
    return 0;
}
{% endhighlight %}

尝试编译，链接执行，看是否和以前一样。我经常被人说“至于嘛，没事把事情搞这么复杂”折腾这么多。没错，如果你只是想过把瘾，确实不需要这么复杂，但是如果你希望程序可以互动，如同你没敲击一个键屏幕上有对应一个字符那样，抱着服务的态度写代码。无非现在我们所学的内容尚少，我们所能提供的服务尚少，姑且先在执行完control,model ,view一次轮回后让死循环结束。方法很简单，如上，g_status = 0; 

鬼话：这里我们对一个存储区域定义的名称多加了个g_，这是因为我对status的存储空间看待为全局存储空间，也即其他C文件的模块均可以访问，那么为了后续提示，我多了个前缀。习惯问题，这样你容易区分哪些存储空间（变量）属于全局。 

但上述方法并不能另你区分，这个存储空间申请，属于在哪个C文件内。一个并不被广泛利用的方法，但很有效，如下：

{% highlight c %}
#include <stdio.h> 
#include <string.h> 
#include "view.h" 
#include "control.h" 
#include "model.h" 
extern int g_status; 
int main(int argc ,char *argv[]){ 
    FILE *f = 0; 
    int view_mode = 0; 
    int control_mode = 0;
    // .....
    return 0; 
}     
int g_status = 0;
{% endhighlight %}

变化不大，无非多了个extern;而实际空间申明落到了函数，准确说是C文件底部。 
鬼话：这可不是什么标准写法。几乎你在教科书上无法找到这种方法。但这种方法很有效哦。因为g_status是全局存储空间，不在乎于实际在哪申请空间，因此上面or下面都一样。但除非声明的那个文件，在其申明之后的代码行才能以直接使用，与其这样，不如所有的C文件都统一书写，在文本上段用extern int g_status;进行空间申明，如同函数申明一样，虽然对应位置如上述第4行，并不是实际空间申请的内容，不过可以告诉随后的函数，这个存储空间的情况。 
     
原则上，存储空间的大多数逻辑含义覆盖在哪个C文件内，就在哪个C文件内进行定义，而如果一个存储区域广泛的分布在各个C文件中，或者你的模块与模块已经连成了一个更有机的整体，也即多个C文件之间的逻辑已经非常关联了，通常你是整体使用他们，还有个做法是独立出一个C文件，将那些全局变量落在该文件中，而对于这些存储空间的初始化等工作均在该文件内实现。 

例如我们现在对MVC的项目增加两个文件，一个是value.c一个是value.h。如下 

value.h

{% highlight c %}
#ifndef _VALUE_H_
#define _VALUE_H_
extern int g_status;
int init_all(void);
void free_all(void);
#endif
{% endhighlight %}

value.c

{% highlight c %}
#include "value.h"
static int init_flag;
static int init_status(void){
    g_status = 0;
    return 1;
}
static void free_status(void){
    return;
}
int init_all(void){
    if (init_flag == 1) {return init_flag;}
    init_flag = 1;
    init_flag = init_flag & init_status();
    return init_flag;
}
int get_init_status(void){
    return init_flag;
}
void free_all(void){
    if (init_flag == 0) {return;}
    init_flag = 0;
    free_status();
    return;
}
int g_status;
{% endhighlight %}

看一下上述代码。我们多了一个init_flag 的存储空间，而且是static类型。意思是外部你就别访问我。我只在内部有效。这个存储空间有什么用？3个。 

1. 我们可以通过这个存储空间内容判断，当前各种存储空间的初始化工作是否进展完毕。如果有一个出错，则对应我们要求返回为0，则此时init_flag在返回init_all函数时，会为0，通过外部对该函数的判断(get_init_status，此函数暂时不写了。)，就可以发现，恩，总缺少什么，没有准备到位，系统不运行下去。 
2. 可以通过一个对外的接口函数判断是哪个模块存储空间有问题，或者当前系统的存储空间是否被释放掉（这在以后讨论动态空间申请时展开），由此可以判断整体空间是否清除干净，以决定是否可以立刻退出。 
3. 防止初始化工作被反复使用，这个在空间申请时详细展开讨论。 

当然实际工程设计时，你可以将init_flag对应每个bit标记不同的存储空间的状态，这样可以描述出更多的内容，以扩展程序的健壮性。不过对应名称最好变变，得改成init_status更为合适。 

对应我们也修改一下attr.c内容如下

{% highlight c %}
#include <stdio.h>
#include <string.h>
#include <stdlib.h>
#include <unistd.h>
#include "view.h"
#include "control.h"
#include "model.h"
#include "value.h"
int main(int argc ,char *argv[]){

    FILE *f = 0;
    int view_mode = 0;
    int control_mode = 0;
    if (init_all() == 0){
        printf("init not finish! system return ...\n");
        return 1;
    }else{
        atexit(free_all);
    }
    
    if (argc < 2){
        printf("please enter the pathname !\n");
        return 1;
    }
    control_mode = ((f = fopen(argv[1],"rt")) != 0);
    if (control_mode){
        strcpy(filename,argv[1]);
        fclose(f);
        view_mode = 0;
    }else{
        filename[0] = 0;
        view_mode = 1;
        strcpy(v_param,argv[1]);
    }
    
    while (1){
        if (g_status == 0){
            break;
        }else {
            control(control_mode);
            model(0);
            view(view_mode);
            g_status = 0;
        }
        sleep(1);
    }
    return 0;
}
{% endhighlight %}

注意

{% highlight c %}
if (init_all() == 0){
    printf("init not finish! system return ...\n");
    return 1;
}else{
    atexit(free_all);
}
{% endhighlight %}

这段代码。首先，任何空间存储化的动作，应该在一个系统启动最初完成。除非你对系统内容有足够经验（不是你的编程经验，而是业务熟练度，明确知道系统各个组成的设计内容），否则最好在最初位置，完成初始化工作。 
     
atexit(free_attr_all)是什么？atexit是一个标准函数。这可是好东西，你可以通过参考文献1寻找到答案。简单的说，atexit的参数里是一个void func(void);接口类型的函数名。我们可以简单称这是注册动作。而该函数意味着在程序退出前（但某些情况不会，详细看文献）按注册动作的逆序，进行一次执行，也即free_all函数不需要任何地方被调用，在main函数退出后，会执行， 

鬼话：当前free_all没有任何作用，但对于存储区域，存在init的函数，保持良好习惯，在设计时，紧跟free_all。现在不用以后用，如果一用好查找。 

鬼话：堆栈是先进后出，在这里，无论atexit会体现到，init_all ,free_all内部的调用顺序也要有所体现。无论你是说“弟兄们，给我上”回头一句“弟兄们，给我顶住，我先撤”，还是“兄弟们，跟我上”回头一句“你们先撤，我断后”。但凡有主有次、有序有列的调用设计，通常是先进后出。 

回到正题，while上。前面一直说while是个死循环，配套有个退出条件，这个很重要，而且通常退出条件你放在 while主体的最开始地方。那么这实际上就等同于传统的while写法，例如我们摸狗100下。

{% highlight c %}
i = 0; 
while (1){ 
    if (i >= 100){ 
        break; 
    } 
    摸狗一下; 
    i++;//糟糕，没有for的自动计数，所以这里要补上。 
}
{% endhighlight %}
这等同于
{% highlight c %}
while (i < 100){ 
    摸狗一下; 
    i++; 
}
{% endhighlight %}

或许有人会说，while (i < 100)多方便啊，你折腾半天while (1)做什么。无非我希望你能理解，死循环的重要性，同时任何死循环均和传统循环一致，都需要存在退出机制。无非for在第二个表达式中，你可以写 i < 100，或者，将此表达式写在 while 的（）里。 

也有人会说，还是for好，因为i< 100和i++写一块，多方便啊。用while 还得初始化。当然你完全可以这么写，

{% highlight c %}
while (i = 0 ,1,i++){ 
         
}
{% endhighlight %}

不过和 `for(i = 0 ; i < 100 ;i++)`可不一样。我们做点例子。在做例子之前，我们修正一下model里的几个内部函数。param_done,param_exit。修改为 model_done,mode_exit 。 

鬼话：通常再好的系统架构师，也无法对整个系统结构的各个函数命名有完整、一次性、完美的设计。函数名调整，在早期开发阶段是经常发生的。不过尽可能的让这个工作放在系统调整中而不是局部代码逻辑丰富或细化时，并尽可能的保证接口函数（对其他C文件开放的函数）的名称稳定。如同当初我们是认为一个param_done就OK了，在main函数中没有model的概念对待，而现在系统裂变扩展了，该改名字改名字。野鬼的本意，也希望通过这个书籍的深入，你的代码在不停的修正和改动，逐步逼近到工程级质量。上来就是对的，你也不用学了。不是吗。 

model.c的model_exit函数修改如下： 

{% highlight c %}
#if 0
static int test;
static void model_exit(void){
    int i;
    
    printf("param_exit func !\n");
    for (i = 0 ; i < 100; i++){
        printf("touch the dog! \n");
        if (test >= 10){
            printf("the officers come ! run away!\n");
            longjmp(context_buf,test);
        }
        test += 1;
    }
    return;
}
#else
static void model_exit(void){
    int i;
    
    printf("param_exit func !\n");
    while (i = 0 , i < 10 ,i++){
        printf("touch the dog! i = %d\n",i);
    }
    return;
}
#endif
{% endhighlight %}

鬼话：这地儿，我又用回了#if 0。通常if 0 用于简单的测试阶段。反正代码总要修正的，没必要通过gcc的参数引入，来进行外部宏预定义。而我们也别摸100下了，10下足以证明问题。同时保持良好习惯，局部静态存储空间test和新代码没关系，记得放到#if 0下面，省去一个编译warning。 

编译，链接，运行。 

啥情况？啥情况都没有。不对了，也就是输出和以前不一样了。怎么办？抓BUG啊。怎么抓，改哪抓哪，看是哪里的改动出错。由此我们需要把代码退回去。先把#if 0改为#if 1，确保model.c的代码和上一章节的测试点一致。继续编译，链接，运行。 

还是错。。大头了，那么我们还改了value和attr。难道我们把代码全部退会？显然不可能，难道我们把value的部分函数去除？这也麻烦。为什么呢？value的已调用函数，有很多是相关联的。因此我们使用另一种方法，代码片测试方法。如下： 

修改attr.c文件的main 函数如下： 

{% highlight c %}
int main(int argc ,char *argv[]){

    FILE *f = 0;
    int view_mode = 0;
    int control_mode = 0;

    if (init_all() == 0){
        printf("init not finish! system return ...\n");
        return 1;
    }else{
        atexit(free_all);
    }
    printf("ready test argc!\n");
    if (argc < 2){
        printf("please enter the pathname !\n");
        return 1;
    }
    control_mode = ((f = fopen(argv[1],"rt")) != 0);
    if (control_mode){
        strcpy(filename,argv[1]);
        fclose(f);
        view_mode = 0;
    }else{
        filename[0] = 0;
        view_mode = 1;
        strcpy(v_param,argv[1]);
    }
    printf("control_mode is set!\n");
    while (1){
    
        if (g_status == 0){
            break;
        }else {
            printf("ready to call func!\n");
            control(control_mode);
        
            model(0);
            view(view_mode);
            g_status = 0;
        }
        sleep(1);
    }
    return 0;
}
{% endhighlight %}

多了三个printf，即打印测试点。这三个地方的增加是有说法的。首先，我们因为增加了if (init_all() == 0)语句而此内部是有return的，因此，你需要判断是否第一个printf点被测试到。 
鬼话：当然你完全可以通过printf("init not finish! system return ...\n");输出来判断。但原则上，测试点的选择尽量不要附加某个逻辑。你放if的任何一个分支，如果是另一个分支被选择并出错，则你无法测试到。而测试点的目的是通过观测测试点的输出来判断问题的大概范围。 

而printf("control_mode is set!\n");增加在两段没有修改的内容之间，这个测试点的目的是因为有两段逻辑代码片，如同章节分割一样，列出测试点，特别是下面紧跟while时，如果你在while中，每次循环均设定测试点，如同 第一个测试点的规则方法一样确保每次均经过，那么经常会导致输出过多。因此此处对第一个测试点安排位置补充一下，需要考虑是否不在循环体内，如果在循环体内，则在进循环，出循环时增加结点测试，而在循环内，对新增分支进行测试。如同第三个测试点。 

编译链接，运行。你会发现，总算有点新输出了。什么情况？第三个输出没有。回头看看代码逻辑。 恩。。。g_status == 0了。 

鬼话：学习C语言，保持良好习惯，=表示 set，设置，存储。而相等，得用==来说。 

现在你可以通过linux下的查找命令，搜索g_status或者凭借记忆，判断g_status在那赋值了。确实，value.c的init_status里，g_status = 0了。哦。原来这里有个BUG。因为查看早期的代码，你的g_status = 1才是正确的逻辑。 

如果我们增加sleep和while (1)后没有做测试，没有验证过，你这个时候毕竟跟头痛，g_status == 1的时候就能保证正确？反复强调，一个代码片修改设计完毕后，就立刻测试。可能随着你的代码的细化，丰富，测试内容在不断的调整，但是测试工作随时展开。 

鬼话：有人问，程序员的职业口号是什么？我支持一句回答“为测试，挥洒代码！”，不过可惜的是，大多数没有经验的程序员口头喊着“BUG不留痕，程序更轻松”。实际呢？代码是挥洒了。。。同时落的一地BUG。为什么说，洋洋洒洒的写代码是为了测试。因为测试是为了目标服务。我们程序员的所有工作是为了业务实现的目标服务。因此，代码为了测试，测试为了验证设计目标。而不是反之。 

调整后，我们继续运行。注意此时编译会有个warning。计算出的值没有被使用。谁？i<0，为什么？因为表达式中有","，编译器认为需要依次执行，而每次执行的结果，均可以作为一个判断内容，除非不影响对应状态标记位。 

`while (i = 0 , i < 10 ,i++)` 等同于 
    i = 0; 
    i < 10; 
    i++; 
然后判断i++计算前的i，看是否不为0 ，如果不为0则进入循环。 

鬼话：不过很可悲的是，这里要说出一个i++和 i = i+1不同之处。i++的结果并不会影响判断条件,而i++中影响判断条件是没有++之前的数值。不信？你尝试如下：

{% highlight c %}
i = 0;
while (i++){

}
{% endhighlight %}

{% highlight c %}
i = 0;
while (i++){

}
{% endhighlight %}

i++和i = i+1的区别在于，i++是在整个表达式处理完毕后再进行处理的。详细的内容你可以参考文献1 6.5.2.4。而另一个方式 ++i则相反，和i=i+1一样，是优先计算的。我们可以简单说i++是后+，++i是前加。什么时候用i++，你可以理解为，我关注i的值使用，而随后+1,通常用在指针存储空间内保存的数值（一个地址）所指向的对应空间的数据使用后，并将指针存储空间内保存的数值进行自动调整，如果你需要从一个连续空间进行访问。例如 
    *p++ = *q++;
那么q指向的地址所对应存储的空间会复制出去，同时p,q两个存储指针的空间内部数值都会自动调整。 

不容易啊，现在能理解 i++的问题吗？如果该值被用于比较判断，切记，是没有++前的。 回到那个warning 上来？这里的wanring说的是 `i < 10`,因为 `i = 0;`是有意义的。 `i < 10` 本来作为判断是有意义的。 `i++;` 存在了。编译器的工作会 check i 后，再 `i = i+1`。 此时 i < 10又有什么意义呢？ 还不信？你把i++去掉，写成诸如 `while (i = 0 , i < 10)` 看是否有 warning ？这里的warning产生的根源在于，i < 10这种比较判断仅有此意义，而传统的 i = 0 ,i++ 等，可同时附带作为比较，所以 `while (i = 0 , i++)` ，并不会因为 有了 i++ ，而认为 i= 0 这个操作对于判断是多余的。因为i = 0自身就有意义嘛。 

鬼话：再次再次强调，warning的重要性。你当复读机吗？诸如，“我们表示最强烈的抗议！”没有意义？回头倒霉了，你别后悔！ 

上述的事实说明， “，"是依次计算的。而作为条件表达式，只是看最后一步的，而不是什么与或非的关系，诸如 
    while ((i= 0) & (i< 10) & (i++))
，这是表示把三个操作的结果，进行比较。你可以自行测试下，此时是i++的结果参与了比较，还是i++之前的 i参与了比较。不再展开，记得注意()的重要性。 

鬼话：与其我把所有的情况都解释给你听，不如你学会，出现疑问如何做测试来理解国际标准，即参考文献1.我没有同情心，别人看你饿着，会把自己烧好的鱼送你吃一口，我？嘿嘿，一脚踹你到海里，先别说捕鱼了，练会游泳先。 

我们针对 修改后的，`while (i = 0 , i++)`进行和运行。毕竟没有warning了嘛。啥情况?什么都没有。很正常。此时比来比去，都是对i = 0,0这个值进行比较。当然不会有输出。那么你改为 `while (i = 1 , i++)`，再试试，啥情况？死循环，真正的死循环。ctrl+c，强制停下来，看看打印了什么？ 
    touch the dog! i = 2 
为什么每次都是i = 2? 即便你如下写：
{% highlight c %}
while (i = 1 , i++){
    printf(""touch the dog! i = %d\n",i);
    i++;
}
{% endhighlight %}

相信我，不用测试，结果还是一直 输出 i = 2。 为什么？因为该死的 i = 1 在每次循环里都会运行。所以千万不要认为 `while (i = 0, i < 100 ， i++)` 和 `for (i = 0; i < 100 ; i++)` 是一样的动作。 这里重复前面说过的一个规则。 
    if () {} else {} 
当 `if (){ //这里有 continue; break; return等 } `, 当有上述情况等，我们无需后面写else {} 因为条件成熟，会跳过本此循环或执行作用域嘛，所以后续的代码内容自然是else的情况，例如main 函数我们可以有如下改动。 

将

{% highlight c %}
while (1){
    if (g_status == 0){
        break;
    }else{
        control(control_mode);
        model(0);
        view(view_mode);
        g_status = 0;
    }
    sleep(1);
} 
{% endhighlight %}

改为

{% highlight c %}
while (1){
    if (g_status == 0){
        break;
    }
    control(control_mode);
    model(0);
    view(view_mode);
    g_status = 0;
    sleep(1);
}
{% endhighlight %}

说来说去，while有什么值得推荐的使用场景？for( ;;)不是也可以死循环吗？你while 还要多个(1)。for 还不需要把i = 0这样初始化工作提到外面进行，并自动可以做 i++。 

鬼话：任何事务没有优点或缺点，只有落在特定场合，特点才被主观的标记为优点。 

那么上述所谓的while 的劣势，则也就是while的优势，在()中可以集中表现判断。同时由于i++不是如for那样在()中辅助写出，需要在实际独立代码中，呈现，那么对于i++的控制更为灵活。注意以下while 的区别。 

{% highlight c %}
i = 0; 
while (i < 100){ 
    摸狗一次; 
    if (城管来了){ 
        break; 
    } 
    i++; 
} 

i = 0; 
while (i < 100){ 
    摸狗一次； 
    i++; 
    if (城管来了）{ 
        break; 
    } 
} 
{% endhighlight %}

上述两个方式,i所对应的值和摸狗的次数是不一样的。第二种，等于摸狗次数，第一种比摸狗次数少1。i++不用机械每次都写在循环之后。而与for循环对应的是第一种写法。这种写法有个问题，如果实际摸了，但因为城管的中断而逃跑,此时i++没有执行，你少计数了一次。这和for的情况很像。而第二中写法，无论城管来不来，那么i的计数是始终准确的。我们完全可以用另一个存储变量来描述

{% highlight c %}
i = 0; 
j = 0; 
while (i < 100){ 
    摸狗一次； 
    i++; 
    if (j = 城管来了）{ 
        break; 
    } 
}
{% endhighlight %}

此时，i准确的表示摸狗的次数，j表示城管是否来过。而对于for则通常得如下写 

{% highlight c %}
for(i = 0 ,j = 0; i < 100 ;i++){ 
    摸狗一次; 
    if (j = 城管来了）{ 
        i++; 
        break; 
    } 
} 
// 另一种 
for(i = 0 , j = 0 ; (i < 100) && ((j = 城管来了)==0);i++){ 
    摸狗一次 
}
{% endhighlight %}

上述使用了条件的混合操作，&&，即逻辑的与。与&数值的与的异同，后面会展开讨论。 
鬼话：其实那种写法好，这个还得看人，你好一个舞大刀，他好一个小刀片，管你是关公还是小偷，切西瓜的时候，谁用自己熟练的解决问题就行。不过，还是推荐，除非循环规则稳定，即循环退出逻辑单一，循环状态变化方式单一，如i++，而不会叠加 (j = 城管来了)，否则还是用while的好，for通常仅用来诸如 i = n , i < m ,i++等固定循环步长的对应逻辑空间全枚举处理的工作。例如

{% highlight c %}
for ( j = 0,i = 1 ; i < 10 ; i += 2){
    j += i;
}
{% endhighlight %}

这里的意思是，求从1开始，到小于10的数中，所有奇数的和。本质上，你可以理解为，对所有 1到9中间的，按照2的步长进行全枚举。每次提取出来数据，对j的存储空间的内容进行叠加，并放回j。后续怎么处理不是for的重点，重点是全枚举。 

我们现在琢磨一下，如果你是狗老板，没人愿意摸狗的时候，怎么办？且不谈遇到个狠的，一次500元，把贵宾摸成沙皮了。通常会营销，怎么处理？免费摸一次，如果没钱，滚蛋，有钱，不好意思，收钱。直到把你皮夹摸空。那么如下

{% highlight c %}
do { 
    来吧，摸一下吧。 
}while (有钱继续);
{% endhighlight %}

那么对应 if 和goto的解释就是 
{% highlight c %}
LABEL_摸摸： 
    来吧，摸一下吧。 
    还有多少钱？让我看看。 
    什么没钱？滚，goto LABEL_game_over; 
    挖还有钱，请您 goto LABEL_模模。 
LABEL_game_over
{% endhighlight %}

其实这个和
{% highlight c %}
摸狗一下 
while (有钱继续){ 
    摸狗一下; 
} 
{% endhighlight %}
是等同。记得，当 `do {} while (expression); `中，expression成立时，是循环到do开始，继续。而不是向下结束。 

通常我们说事可以两种方式，你如果可以，就继续去做；你去做，如果可以就继续。这是传统的两套言行。则do {}while( );的价值在哪呢？其价值在于有些逻辑需求，需要，先做，才能判断是否继续。而for ,while 均是，先判断是否可以，再继续。 

如果你还是不理解，do {}while (expression);不妨说说你的面试。我挺反感面试官一句话，“你做过吗？你没做过这样的工作，我怎么知道你行？”。大爷的，你这不是抬杠吗？那我反问美女，你这个女人，是不是只有在你确实生过孩子之后才能证明你可以生孩子？很多事情，行不行，需要验证的。对于一些代码实现也一样。 

关于do {} while ()中continue ,break的位置，我就不举例了。你可以使用反汇编，或者参考文献1进行理解。不过说说do {}while的一个典型利用。 我摘抄参考文献1在 6.8.5的一段 

    while (expression) statement 
    do statement while(expression); 

关于statement实际就是我们的代码片，当然多条语句，你需要{}，详细内容你可以参考文献 6.5 6.8有更详细的解释。注意一个小细节。 

do while后面有个分号。而while 后面是没有的。这意味着我们把do statement while(expression);可以当作一个独立的语句来看待。 

而相对，while (1)，我们又另一个设计， 
     do {} while (0) 
while (1)表示，死循环。 
`do {} while (0)` 表示，没循环。简单说，凡是只有一次。这有什么好处？这里预先引入一个宏操作。 
    #define A B 
其意思是，预处理程序，对C代码操作，在任何出现独立的A文档中，会将A替换成B的内容，给编译器。那么我们对于一个逻辑动作，需要多个C语言语句才能完成，而同时，这个逻辑动作又在多种情况下出现时，我们可以用#define 的方式来替换。至少有以下几个好处： 
1. 提成代码阅读性。 
2. 降低代码误编辑错误。 

别小看上述两个好处，但一个，就足够令你舒坦了。 实际我们前面也说了，记得摸一下，和看一眼的区别吗？ 摸一下，包含了4个动作: 手张开; 伸进笼子; 手拿出来; 按&摩按&摩自己的手，休息一下; 

要么我们如下写： 
{% highlight c %}
void 摸一下(啥 物){ 
    手张开; 
    伸进笼子 摸物; 
    手拿出来; 
    按&摩按&摩自己的手，休息一下; 
} 
{% endhighlight %}

则当调用 摸一下（狗）;那么没问题。这是函数过程设计方法。我们把过程的细节，用子函数的方式实现。但无休止的用子函数的方式实现子过程未免太无聊。那么我们不妨如此 
    #define 摸一下(物)     手张开;\ 
    伸进笼子 摸物;\ 
    手拿出来;\ 
    按&摩按&摩自己的手，休息一下; 
    补充说明，\的含义是我一行不够写了，用\表示下一行逻辑上，就是跟着本行的。而不是新的一行。 
    此时，在任何写了 
    摸一下(狗) 
    的地方会预处理会替换为 
    手张开;\ 
    伸进笼子 摸狗;\ 
    手拿出来;\ 
    按&摩按&摩自己的手，休息一下; 
不过还记得摸一下，和看一样的悲剧了吗？就是我们重点介绍的{}，你会发现，如果放在if 里，你还会导致另一个编译错误。

{% highlight c %} 
if (城管没来呢) 
    摸一下（狗) 
else{ 
    break; 
} 
{% endhighlight %}
则展开为
{% highlight c %}
if (城管没来呢)
    手张开; //此时if语句已经结束。 
    伸进笼子 摸狗;\ 
    手拿出来;\ 
    按&摩按&摩自己的手，休息一下; 
else { 
    break; 
}
{% endhighlight %}

不好意思，else 你哪来的？ 如果你#define 中，对B部分，强制加上{}，看似问题解决了。没错。这里解决。另一个问题有出现了。 摸一下(狗)你究竟打算 加;还是不加分号？加了 if () 摸一下（狗);else语法不支持。不加，好的,你的代码如下： 
{% highlight c %}
if (城管没来呢) 
    摸一下（狗) 
else{ 
    break; 
}
{% endhighlight %}

当你打算把摸一下（狗）一下改成函数时，你就痛苦的继续追加;号吧。如果哪天你又想不同，想把函数修改为宏，则你得继续删除分号。 而do {}while (0)则可以回避这个问题。对代码书写统一。 

这里说说实际的工程应用，就do {}while(0)。do {}while (0)里面可以包含很多代码组合。我称为代码片。如果是用do {}while (0)的方式，显然比掉函数的方式来得快捷，当然不能如函数那样有返回。而掉函数，对于增加测试点，等逻辑验证更有效。再第二部分，介绍算法优化里会展开讨论。因此不要小看，do{}while(0)可以保证摸一下(狗）后面可以增加分号这个代码书写统一的优势。 

代码的优化，或者逻辑验证，有一个重要的方式就是替换法。这种替换法使得，在没替换前有一个正确的版本，替换后，如果发现错误，可以改进，如果没错误，可以比较两种方法的性能优缺性。 

替换法使用的一个重要经验，谈不上原则，尽可能的不影响周边代码。而 do {}while(0) 的优势就在此体现。 
鬼话：我不知道软件培训学校的老师，告诉你 do {}while (0) 列举了多少国外大牛的名言。至少我相信，我使用 do {}while(0) 利用 do {}while(0) 频率不比国外大牛的次数少，毕竟做了10多年的算法优化工作。因此，各位在这个问题上，不要抵触你的老师，实践中会发现他的便利性。 

至此，涉及循环的，我们说完了。但是衍生看一下model函数。完整的model.c文件如下，这里恢复了model_exit函数内容。  

{% highlight c %}
#include <stdio.h>
#include <setjmp.h>
jmp_buf context_buf;
static int test = 0;
static void model_done(void){
    int i;
    printf("param_done func !\n");
    for (i = 0 ; i < 100; i++){
        printf("touch the dog! \n");
        if (test >= 10){
            printf("the officers come ! run away!\n");
            longjmp(context_buf,test);
        }
        test += 1;
    }
    return;
}

static void model_exit(void){

    
    printf("param_exit func !\n");

    return;
}

void model(int status){
    
    int t;
    if (status == 0){
        if ( (t = setjmp(context_buf)) >= 10){
             printf("my god ,i escape! %d\n",t);
             status = 2;
         }
    }
    if (status == 1){
        model_done();
    }
    if (status == 2){
        model_exit();
    }

     return;
}
{% endhighlight %}

而attr.c修改为：

{% highlight c %}
#include <stdio.h>
#include <string.h>
#include <stdlib.h>
#include <unistd.h>
#include "view.h"
#include "control.h"
#include "model.h"
#include "value.h"
int main(int argc ,char *argv[]){

    FILE *f = 0;
    int view_mode = 0;
    int control_mode = 0;

    if (init_all() == 0){
    {
        printf("init not finish! system return ...\n");
        return 1;
        }
    }else{
        atexit(free_all);
    }
    model(0);
    if (argc < 2){
        printf("please enter the pathname !\n");
        return 1;
    }
    control_mode = ((f = fopen(argv[1],"rt")) != 0);
    if (control_mode){
        strcpy(filename,argv[1]);
        fclose(f);
        view_mode = 0;
    }else{
        filename[0] = 0;
        view_mode = 1;
        strcpy(v_param,argv[1]);
    }
    
    while (1){
        if (g_status == 0){
            break;
        }else{
        
            control(control_mode);
        
            model(1);
            view(view_mode);
            g_status = 0;
        }
        sleep(1);
    }
    model(2);
    return 0;
}
{% endhighlight %}

注意，model被调用了两次，一次是model(0);意思是初始化。你看到没有。model函数中，如果为0 ，我们设置了一个longjmp的跳回点，算出错初始化点。同时在后续执行中，我们使用model (1),而在整个while (1)之后，我们使用model(2)。 

这样做有什么好处？接口统一。我们model的模块始终是一个。通过不同的接口参数来决定model内部实际由哪个工作组成。这样为该模块提供给别人使用，带来方便。如同一站式服务。接待你的服务美女，是她，随后你的事情，出了任何问题，还是找她衔接。你说换谁不乐意？始终都是这个美女相伴。当然你老婆未必同意。 

鬼话：这里说两句。其一，给别人使用，这个别人通常也包括你自己，为别人着想，通常也是为未来的你而着想。其二、一个模块至少三个函数。init ,done,destory，的模式落伍了。。接口统一性，参数可变通，是模块化设计的精髓。别整天跟着面向对象的思想，天天琢磨模块的构造等名词导致你坚持使用三函数的方式来设计模块接口。 

虽然，代码逻辑设计越来越复杂，但是越来越人性化。一个模块，我们可以清晰的告诉始终者，你有一个接口，他有三段工作，初始化，运行状态，释放。你分别给入3个对应参数，就可以了。这也符合模块的自身生命周期嘛。 

不过带来的问题是，model函数本身，确实逻辑描述复杂了。好多if眼花撩乱。这里对一个存储内容的判断，有两类写法。上面是一种。还有一种如下

{% highlight c %}
if (status == 0){

}else if (status == 1){

}else if (status == 2){

}
{% endhighlight %}

上述方式我喜欢叫做排斥法。好处，比较次数少，而且每次只进入一个分支。 

{% highlight c %}
if (status == 0){

}
if (status == 1){

}
if (status == 2){

}
{% endhighlight %}

这我喜欢叫做是枚举法，坏处就是每个判断都要折腾。好处呢？还不是我上面status 在 城管出现时，你可以逃逸回来，并设置status == 2表示可以直接退出。而是如下

{% highlight c %}
if (摸狗次数 > 90){ 
    惨烈地
} 
if (摸狗次数 > 50){ 
    反抗地 
} 
if (摸狗次数 >= 10){ 
    叫
} else { 
    舒服的哼 
}
{% endhighlight %}

那么如果次数 > 90则是 狗惨烈地反抗地叫。 >50是狗反抗地叫， >=10，叫。小于10次，舒服的哼。 

当一个逻辑，随着一个判断量的变化，具备向前或向后兼容时，则不能使用排斥法。而枚举法的设计，需要非常注意，在不同分支中，对判断内容的修正动作。如果修正不当，则会导致逻辑错误。原则上，诸如我的代码中

{% highlight c %}
if (status == 0){
    if ( (t = setjmp(context_buf)) >= 10){
        printf("my god ,i escape! %d\n",t);
        status = 2;
    }
}
{% endhighlight %}

这里是不妥当的。先不讨论上述不妥当的问题。先解决一下语句设计排版简化的问题。由此引出switch case语句。别怀疑我的动机。switch case 我个人仅在设计代码排版时，会考虑用它。先说下它的使用方法，你可以在参考标准1的 6.8.4.2中找到swtich的描述。通常的使用方法，switch 包含case。如下

{% highlight c %}
switch (expression){ 
    case XX: 
        statement; 
}
{% endhighlight %}

为什么说通常，你看看标准对switch的描述就知道了。switch (expression) statement 因此，{case XX: statement}并不是switch的必写项，如同default XX:一样。如同标准在6.8.1.2中，列出的，case LABEL,default(LABEL)仅针对switch使用。 这里重点说说 case XX:究竟是什么。 可以明确的说，就是标号，和我们前面的 
    LABEL_摸狗开始： 
等等没有本质区别，无非是条件标号。即，符合条件时，会进入当前标号。那么我们判断一下下面的swtich会有什么结果

{% highlight c %}
i = 15; 
switch (i){ 
    case 10: 
        叫; 
    case 50: 
        反抗的; 
    case 90; 
        惨烈的； 
    default: 
        爽着哼。 
}
{% endhighlight %}

没错，如果你尝试构造一个函数执行的试试。什么都不会进入。这里解释下我上面对switch的不屑。case 的条件，是直接相等比较。且只能是整型。你使用段区域进行比较。或者字符串以及其他复杂逻辑的比较，是无法结合case的。 

那么我们把i = 分别修改为, 10 , 50 ,90，看看是否是我们想得到的。确实是。但非常需要明确的，这里并不是说上述写法等同于枚举法。我们用if goto来对switch进行分析。

{% highlight c %}
if (i == 10) goto LABEL_case10; 
    if (i == 50) goto LABEL_case50; 
    if (i == 90) goto LABEL_case90; 
    goto LABEL_default; 
LABEL_case10: 
    叫; 
LABEL_case50: 
        反抗的; 
LABEL_case90： 
    惨烈的； 
LABEL_default: 
    爽着哼;
{% endhighlight %}

这和我们全枚举的对应if显然不同。 和排斥法差异也相当的大。当差异但，反倒是可以和排斥法有一定的对应关系，而和全枚举无法对应起来。为什么？全枚举的方法，具备全向的比较，而switch除非default的情况，否则不会做所有比较。 

我们可以通过增加break;来实现排斥法。break就是跳出当前作用域嘛，因此就是最后。则 

{% highlight c %}
switch (i){ 
    case 10: 
        叫; 
        break; 
    case 50: 
        反抗的; 
        break; 
    case 90; 
        惨烈的； 
        break; 
    default: 
        爽着哼。 
        //这里有必要加吗？除非你把default不放最下方。 
}
{% endhighlight %}

其等同于

{% highlight c %}
if (i == 10) goto LABEL_case10; 
    if (i == 50) goto LABEL_case50; 
    if (i == 90) goto LABEL_case90; 
    goto LABEL_default; 
LABEL_case10: 
    叫; 
    goto LABEL_end; 
LABEL_case50: 
        反抗的; 
    goto LABEL_end;         
LABEL_case90： 
    惨烈的； 
    goto LABEL_end;     
LABEL_default: 
    爽着哼。     
LABEL_end:
{% endhighlight %}

而这个和排斥法的差异仅是描述上。逻辑上没有区别。 由此，我不知道你是否搞清楚两个事实？ 
1. break;和swtich 语句没有任何关系。 
2. 只有你想排斥法时，才需要加break;，而通常排斥描述，使用switch的可能性更大。 

抱怨一句，我找不出必须使用switch的理由。除了代码文本好看。除了抱怨。这里介绍点switch只能做整型比较的不足的补充方法。 方法很简单，通过映射。诸如我们要选择  0 < i < 10 , 10 <= i < 50 , 50<= i < 90 ; i <= 90四个区间做四个不同的事情，可以如下 

{% highlight c %}
if (i >= 0){
    if (i < 10){
        j = 0;
    }
    if (i < 50){
        j = 1;
    }
    if (i < 90){
        j = 2;
    }
    if (i >= 90){
        j = 3;
    }  
} else {
    j = -1;
}
{% endhighlight %}

这和如下逻辑是相同的。

{% highlight c %}
if (i >= 90){
    j = 3;
} else if (i >= 50) {
    j = 2;
} else if (i >= 10) {
    j = 1;
} else if (i >= 0) {
    j = 0;
} else {
    j = -1;
}
{% endhighlight %}

这里我特地给出了一个排斥法和全枚举法比较有关联的两个逻辑代码片，你可以琢磨琢磨什么类型的逻辑适合上述两种方式的替换。 

鬼话：上面的问题，我就不解释了。很多东西，我列举了一大堆原理和知识，回头真得工作中，该忘的，一样只剩点渣，以我的经验这个渣还影响你实际的正常思维，如果你经验不足时。索引，告诉你，有些事情，在实际工作中自己总结。有些东西是叫不了的，如态度，心态，经验。 

当然，附带送个另一个写法，如下：

{% highlight c %}
j = -1;
j += (i >= 0);
j += (i >= 10);
j += (i >= 50);
j += (i > 90);
{% endhighlight %}

扩展的讨论一下，或许学院派的高手，要如数家珍的列举，你这里有5个计算（包括最初的设置），而前面的方式每种分支只需要一次赋值。你这个方法，大大的不好。那么我也就一句回答：“跳转不花钱？”。 

需要注意，(i >=0)等，这个是比较。连判断都不算。比较判断这个其他高级语言的粗词，对于C程序员需要明确，实际包括比较，判断，跳转。而此处仅是，将(i >= 0)的比较结果，用于 j+= 的计算而已。 

这里也需要提醒初学者。有些书籍，由于历史悠久，举的很多例子，属于早期，C语言设计工程经验没有被广泛总结和积累的阶段。有些例子的实用性并不好。如果你将这类例子作为自己设计逻辑代码片的模板，会在后期工作中，增添不少麻烦。switch就是一个典型。 

好了。最后为了美化版式，我们将model函数修改如下:

{% highlight c %}
void model(int status){
    int t;
    int flag = 0;
    do {
        switch (status){
            case 0:
                if ( (t = setjmp(context_buf)) >= 10) {
                     printf("my god ,i escape! %d\n",t);
                     status = 2;flag = 1;
                }
                break;
            case 1:
                model_done();
                break;
            case 2:
                model_exit(); flag = 0;
                break;
            default:
                printf("error ! the status value is illegal!\n");
                status = 2;
                flag = 1;
        }
    } while (flag);
    return;
}
{% endhighlight %}

注意，switch中间，尽量不要写goto。你可以通过再次进入的方式，对default和被城管追，而导致需要 case 2的情况进行修正。方法是flag。 
    
不过需要注意提醒的。通常并非如此设计，上述的设计不算糟糕，但不良好。实际情况是存在一个while (1)，死循环。而在下一次循环时在进入。而每个模块，包括model,view,control，均是独立的一个进程（不考虑进程和线程的区别），各自独立运转。无法是在没时间干是，干什么？睡觉。睡觉是一种态度。我说了。 

当然扩展补充一下，睡觉除了sleep以外有很多中方式。包括使用进程方面的操作函数，通常和平台&编译器有关，和C国际标准无关。而我们诸如从键盘输入一个字符的函数，也是一种睡觉的态度。实际是一种堵塞模式。赌塞模式的本质即，条件不成熟，就歇着。也就是广义上的睡觉。