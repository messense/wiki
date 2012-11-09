---
layout: post
category: candcpp
title: 从 goto 说起
---

# 从 goto 说起

MVC的设计任务显然没有完成，不过为了更好的把后续工作做好，此处不得不插播一些其他内容。以拓宽我们对C的学习。  
以下说两句鬼话，绝非属于正常教育学习路线： 
1. 本篇将介绍ARM的工具，利用ARM的反汇编，来理解C语言的代码行为。 
2. goto是个好东西，不用无非有更好的语法方式描述逻辑，而当前计算机内的程序到处充斥这goto。对C语言中，宏、指针、goto的深刻理解，决定你的实际水平。当然这里的goto并非对应C语言的goto语句，而是跳转。 

以下给出ubuntu环境下，ARM开发相关工具建立的流程。 
    sudo apt-get install gcc-arm-linux-gnueabi 
构建完毕后，可通过 
    arm-linux-gnueabi-gcc -v 检测安装的版本 
这里我们仅介绍两个命令，先进入attr.c对应的目录执行如下命令 
    arm-linux-gnueabi-gcc -c attr.c -o attr.o 
    arm-linux-guneabi-objdump -d attr.o 
此时你看屏幕上是否有输出。通常我们可以将输出的内容保存到磁盘文件上，如下 
    arm-linux-guneabi-objdump -d attr.o -o >> attr.debug 
\>\>是重定向。简单说对程序stdout的内容，写入到attr.debug文件中，也就是将屏幕打印的内容写到文件中。和>的区别，你可以看作后者是删除掉目标文件内容重新写入，前者是在目标文件尾端进行追加。尝试上述命令两次，你即可理解。更详细的资料你需要参考linux 下 shell应用的相关资料。此不属于C部分，就不做介绍。 

上面我们完成了两个工作。第一个是做交叉编译，将C语言程序编译成ARM指令，可针对ARM使用的对象文件。后一个是反汇编（你可以这么简单理解，将对象文件，用汇编语句进行解释）。你完全可以执行下面的语句 
    arm-linux-gnueabi-gcc control.c view.c model.c attr.c -o attr 
    arm-linux-gnueabi-objdump -D attr 
前面的第一个语句，不要怀疑，生成了，可在arm 上运行的执行程序。后面一个命令，会多出一堆的东西，详细你可以通过 
    arm-linux-gnueabi-objdump -help
来查看参数使用。 

可以告诉你，你已经完成了交叉编译的工作。当然不完整。谁说C语言才学了一点就不能做交叉编译开发？你现在就在做。当然和你在X86上随着此书学习的C语言开发一样，很低级，很初步。但你确实做了。无非目前无法执行检验结果。当然我们的目标是要看到汇编，通过汇编理解C语言代码，经过编译后，是怎么指导计算机运行。 

拓展的说一段，此处推荐我多年的好朋友，宋宝华的书籍。在嵌入式环境下开发，而非算法设计方面，只有当这兄弟并排和我站在一起时，我通过身高获取点点满足感。详细涉及特别是ARM下的嵌入式开发，宋宝华的书籍是你值得你学习的。 

另，为了有效理解ARM的汇编，你可以下载一些ARM指令集体系的文档，PDF，WORD，CHM的均有，由于此不是C语言内容，所以不给出参考文献，但设计到讨论中的汇编，我会给出简单介绍。 

拓展的说一段，为什么我选择ARM的汇编，而不直接使用X86的汇编进行讨论。理由很充分，也很简单。一个是RISC，一个是CISC。相关知识你可以在WIKI，或通过google找到，我的直白感受，RISC是把复杂的问题搞简单，CISC是把简单的问题搞复杂（当然简单复杂都是相对的）。 

我们重新书写model.c和修改attr.c的代码如下，毕竟model模块还没有接口 

model.c如下：

{% highlight c %}
#include <stdio.h>
static void param_done(void){
    printf("param_done func !\n");
    return;
}
void model(int flag){
    param_done();
    return ;
}
{% endhighlight %}

attr.c 如下 

{% highlight c %}
#include <stdio.h>
#include <string.h>


#include "view.h"
#include "control.h"
#include "model.h"
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
    control(control_mode);
    
        model(1);
        view(view_mode);
    
    return 0;
}
{% endhighlight %}

新增 model.h如下 
    #ifndef _MODEL_H_ 
    #define _MODEL_H_ 
    void model(int); 
    #endif 
执行 
    gcc -Wall control.c view.c attr.c model.c -o attr 
删除掉 ./attr.c1,执行 
    ./attr attr.c1 
    ./attr attr.c 
看看输出是否和以前一致，如果一致表示我们的新增代码没有破坏以前的逻辑，当然不代表我们新增了逻辑。以后保持这个良好习惯，后续文章将不在描述这类工作，此处再次反复，是希望你真得能养成了这个习惯。 
我们再执行如下指令 
    arm-linux-gnueabi-gcc -c model.c -o model.o 
    arm-linux-guneabi-objdump -d model.o > model.debug 
带开 model.debug ,清单如下和说明如下，增加的说明部分以 //开头，通常汇编是用;或者#来作为说明开头，此处我们不是做汇编设计，因此使用C的注释法 

Disassembly of section .text://.代码段的反汇编 。有些系统也叫 .code，你可以简单理解程序中某个区域，有特定的含义，和相对一致的性质，我们称为段。 

00000000 <param_done>:   //这是个函数的代码， 000000并不是真是的地址，仅是表示在代码段的位置，你看，仍然是一切从0开始  

{% highlight asm %}
   0:    b580          push    {r7, lr}
   2:    af00          add    r7, sp, #0
   4:    f240 0000     movw    r0, #0
   8:    f2c0 0000     movt    r0, #0
   c:    f7ff fffe     bl    0 <puts> //bl是一个跳转指令，跳转到其他函数，这里可以发现，printf其实在刚才的ARM下，是调用了puts函数
  10:    bd80          pop    {r7, pc}
  12:    bf00          nop

  00000014 <model>:
  14:    b580          push    {r7, lr}  //从这开始
  16:    b082          sub    sp, #8
  18:    af00          add    r7, sp, #0
  1a:    6078          str    r0, [r7, #4]//到这结束，是函数进入后，对参数的一个保存动作，flag的值由外部传递，由于是第一个，那么就存放在r0这个寄存器里，当然你问我为什么要这么麻烦的保存，这只是一个默认的编译套路
  1c:    f7ff fff0     bl    0 <param_done> //goto 到 param_done函数，此处你会发现，只是个<param_done>并没有实际地址，这是因为此是编译，不是链接，链接会因为发现了<param_done>函数的位置，修正此处的内容。
  20:    f107 0708     add.w    r7, r7, #8 //从这开始
  24:    46bd          mov    sp, r7
  26:    bd80          pop    {r7, pc} //到这结束，是函数返回前的工作
{% endhighlight %}

或许你要问，编译套路折腾那么多语句做什么？其实都是有原因的，当然现在做这些没有意义。你完全可以如下执行命令 
    arm-linux-gnueabi-gcc -c -O2 model.c -o model.o 
    arm-linux-guneabi-objdump -d model.o >> model.debug 
将新的编译对应的objdump的工作，追加到model.debug中。看看两次的变化。不要怀疑你的眼睛。至少有两个大变化。 
1. param_done函数消失了。这是因为我们增加了static 表示是局部函数。因此param_done并没有一定要存在的必要。这个和model函数作为默认的外部函数，可能会被其他C文件调用不一样，无论是否有调用都要编译它。而param_done是如此简单，因此没必要再去调用。直接把他的工作，放到了实际的model函数中执行了。 
2. model函数中，上述的默认编译套路都没有。整个model前后只有3行。

扩展的说一句，static有几个用法。可以针对函数也可以针对储存空间（变量）。而对于存储空间而言static的意思是静态的。也可以理解是有自身空间的。同时由于是静态的地址，在每个C文件中，会有对应空间分配，因此不能通过extern的方式，由外部访问，由此有局部的含义。万恶的英语，如同free 。简单的理解，static函数，如果不被调用或者非常简单，是会被优化编译时，抹掉的，而static存储区域（变量），无论合适都有自己的独立空间。或许这样你就能理解static局部和静态两个解释该什么时候使用了。

通过上面的例子，是要说明，在本书的后续讲解中，我们使用默认编译，即标准的编译可以称为debug模式。这是防止汇编实现逻辑和C语言逻辑的变化。同时，不要怀疑编译器的优化智能，实际产品成型时，需要诸如 -O2,-O3等优化编译选项（具体参考编译器说明），而不是debug模式。我们在做产品，而不是应付老师的作业。 

回到整体，这里就有个bl，跳转，而我们本文要介绍的switch,while ,goto ,break, continue，均是带有或直接是跳转工作。无非是本函数内的跳转，还是跳转到另一个函数去。我们修改下model函数的代码，再进行交叉编译，看一下反汇编。 

model.c 

{% highlight c %}
#include <stdio.h>
static void param_done(void){
    printf("param_done func !\n");
    return;
}
void  model(int flag){
    if (flag){
        param_done();
    }
    return ;
}
{% endhighlight %}

反汇编model函数的内容如下： 

{% highlight asm %}
    00000014 <model>:
    14:    b580          push    {r7, lr}
    16:    b082          sub    sp, #8
    18:    af00          add    r7, sp, #0
    1a:    6078          str    r0, [r7, #4]  //此处是存储flag到堆栈中（一种存储空间）
    1c:    687b          ldr    r3, [r7, #4]   //差异，此处是读取flag，为什么不直接使用，老话，编译套路问题
    1e:    2b00          cmp    r3, #0    //差异，条件比较，实际是 用 flag 减去 0 注意不是flag 和0的比较（我们通常的思维）
    20:    d001          beq.n    26 <model+0x12> //如果不等于，即 flag 不为0，只有0-0的结果才是0嘛，我们就跳转到 26号地址
    22:    f7ff ffed     bl    0 <param_done>  //我们执行函数调用
    26:    f107 0708     add.w    r7, r7, #8 //这里这里，这里是26号地址
    2a:    46bd          mov    sp, r7    // 如下，有是套路。哈。不需要关心
    2c:    bd80          pop    {r7, pc}
    2e:    bf00          nop
{% endhighlight %}

对比一下前面的反汇编，我上面给出了差异性注释。这里说明一下beq.n。 

你可以参考ARM的指令集详细了解beq.n的含义。其实你可以看作是 b跳转， eq.n条件。别以为机器有多智能，它只能一条线的工作。如果你有分支，则需要比较、判断、跳转。无非我们没有else语句。修改model.c如下 

{% highlight c %}
#include <stdio.h>
static void param_done(void){
    printf("param_done func !\n");
    return;
}
static void param_exit(void){
    printf("param_exit func !\n");
    return;
}
void model(int flag){
     if (flag){
         param_done();
     }else{
         param_exit();//printf("model func flag == 0\n");//此处增加一个判断测试点
     }
     return;
}
{% endhighlight %}

反汇编的model函数的内容如下： 

{% highlight asm %}
00000028 <model>:
  28:    b580          push    {r7, lr}
  2a:    b082          sub    sp, #8
  2c:    af00          add    r7, sp, #0
  2e:    6078          str    r0, [r7, #4]
  30:    687b          ldr    r3, [r7, #4]
  32:    2b00          cmp    r3, #0
  34:    d002          beq.n    3c <model+0x14>//不成立时跳到3c(这些都是16禁止，也即每行的第一列内容:前的）
  36:    f7ff ffe3     bl    0 <param_done>
  3a:    e001          b.n    40 <model+0x18> //成立了也不能执行下面啊，别踩狗屎，赶快跳到if else之后，40的位置
  3c:    f7ff ffea     bl    14 <param_exit>   //不成立就执行这，从34的位置跳过来
  40:    f107 0708     add.w    r7, r7, #8 //这里的语句，无论你们是否成立，都会执行我的。。。
  44:    46bd          mov    sp, r7
  46:    bd80          pop    {r7, pc}
{% endhighlight %}

这里注意到beq.n b.n都是包含两个动作，如上讨论，判断和跳转，而cmp 是做比较。因此 ，切记切记，所谓的条件跳转需要比较、判断、跳转3个动作。而诸如C语言的goto 语句， break 语句， continue语句，属于直接跳转，后续会展开讨论，并没有比较和判断的动作。 

补充一下，我们增加了函数的测试点。param_exit，因此，我们现在要对测试比较文件进行刷新。这个工作可少不了。否则你后续的代码无法保证是否正确。刷新的方式一定要有一下几个步骤： 
1. 关闭param_exit的输出，也就是把printf("param_exit func!\n");注释掉。对所有可能输入情况进行测试，确保现有逻辑调用正确。 
2. 打开注释，对各种可能的输入情况进行测试，通过对比第一步骤的输出差异性，确认当前param_exit的调用逻辑正确。 
3. 对各种情况，在上述打开注视所输出的内容进行存储。而老内容，你现在的水平还是丢弃吧。正常的项目管理，需要和代码一样备份到版本管理器里这是后话此处不展开讨论。 

那么我们也可多此一举的使用C语言提供的跳转命令 goto来模拟上述的 if else 动作。使用方法其实很简单，如同上述的 b，而且是无条件的跳转。当然和汇编有点相同的是，需要告诉编译器跳转到什么位置。由此，一个新的名词，标号，需要介绍。标号的方法是定义一个标号名，随后跟上一个冒号如下 LABEL_NAME : 

这句话本身没有逻辑意义。只有当存在明确的 goto后，才被附加了逻辑含义。如同这是一个坑，并没有什么意义，天下之大，到处都是坑。那么当有个厕所指示牌指向它时，就不一样了。当然这个坑仍然是坑，不过是个应急坑了。方法即 `goto LABEL_NAME;` 也即，goto 后面增加莫个标号，随后再增加分号。 则上述 if else 可以如下写 

{% highlight c %}
void model(int flag){
    if (flag != 0){
        goto LABEL_param_exit_called_mode;
    }
LABEL_param_param_called_model :
    param_done();
    goto LABEL_return_model;     
LABEL_param_exit_called_model:
    param_exit();
LABEL_return_model:         
    return;
}
{% endhighlight %}

此时对model.c进行编译（记得加上-Wall)，你会发现有一个错误和两个警告。 警告是 LABEL_param_exit_called_model 这个标号没有被使用过。 错误是 LABEL_param_exit_called_mode 没有被标记，显然没标记，你让编译器goto到哪？ 

就是再眼花，现在你也能看出上面的错误，是笔误，model写成了mode。这里强调了warning的价值，关注每个warning对于你发现现在的编译错误的BUG和潜在的逻辑错误有很大的帮助。 

鬼话：原则上，C语言设计，无论工程多大，都不应该有warning。你可以通过 参考文献三查找到我们在gcc编译时，如何使用开关来屏蔽某些warning。但慎用。对于warning应当像对待error一样重视。 

此处给出参考文献 4 ，gcc 的 manual 下载地址为 <http://gcc.gnu.org/onlinedocs/> 你可以找到诸如 GCC 4.7.2 Manual 的链接。下个PDF挺好。哈。 对应的gcc.pdf，我们是需要查找对warning相关的参数信息，则你在目录中，可以发现有 GCC Command Options，对应该章节，你可以发现有 Options to Request or Suppress Warnings，即对应的3.8 。拜托，诸位的英语应该比我好，所以以后我就不再介绍如何从文献中检索资料的方法了。 在3.8中，你可以发现有-Wall的错误。 

鬼话：虽然原则上 C代码，很少没有warning。但还是坚持把warning如同error。想办法清楚掉warning。 例如，LABEL_param_param_called_model这个标号，如果你坚持需要它存在，或许以后的逻辑需要使用，那么你可以做一个无效代码，如下 

{% highlight c %}
void model(int flag){
    if (flag != 0){
        goto LABEL_param_exit_called_mode;
    }
LABEL_param_done_called_model :
    param_done();
    goto LABEL_return_model;     
LABEL_param_exit_called_model:
    param_exit();
LABEL_return_model:         
    return;
    goto LABEL_param_done_called_model ;// no meaning, only hiding LABEL_param_called_model warning
}
{% endhighlight %}

这样写，首先是废话，因为新加的代码，永远不会被执行掉。在O2编译下，还会被抹去。这类代码，我个人的描述为，注释代码，虽然不是注视，但是这种没有意义的代码对理解代码本身，或描述逻辑有帮助，同时这类代码由于没有意义，但可以屏蔽掉一些warning，则还是有存在的价值的。 

例如有一天，你想补充这里的逻辑，想跳转到param_done()位置， 标号的设计，是有统一规范的（谁规范，不是你，就是你的领导)，你完全可以提前写上，无需真实使用时再上下找，应该使用什么规则。同时后面的注释也表明，到目前位置，这个标号还空着呢，大爷的，还没对这个标号的价值有所体现，你这个设计师是不是漏了什么？因此后面我的英文注释 no meaning并不是废话。 

展开讨论下标号的命名规则，和存储空间，函数名一样，唯一的根本规则就是没有规则。但从设计习惯上，每个开发团队有自己的风格。就我的风格是 前面一定是 LABEL大写。因为汇编写多了，函数起始也是标号，这种非函数标记的标号要有所区分。 

随后无论小写还是大写，说明清楚这个位置的逻辑含义，如同 call param_done这个函数。最后，再写出当前这个标号所在的函数名。你觉得复杂，无所谓，我说了。没有规则，但我习惯我的规则，而且回避了很多开发问题，此处不一一列举，学不学我的风格，我不介意。 

现在我们反汇编一下，后续不再解释，任何反汇编，实际就是如本文的针对ARM的交叉编译。我们获得汇编如下： 

{% highlight asm %}
00000028 <model>: 
  28:    b580          push    {r7, lr} 
  2a:    b082          sub    sp, #8 
  2c:    af00          add    r7, sp, #0 
  2e:    6078          str    r0, [r7, #4] 
  30:    687b          ldr    r3, [r7, #4] 
  32:    2b00          cmp    r3, #0 
  34:    d102          bne.n    3c <model+0x14> 
  36:    f7ff ffe3     bl    0 <param_done> 
  3a:    e002          b.n    42 <model+0x1a> 
  3c:    bf00          nop 
  3e:    f7ff ffe9     bl    14 <param_exit> 
  42:    f107 0708     add.w    r7, r7, #8 
  46:    46bd          mov    sp, r7 
  48:    bd80          pop    {r7, pc} 
  4a:    bf00          nop      
{% endhighlight %}

对比一下，有啥结论？无非多了两个nop，nop汇编表示什么事情不干。因此结论就是C代码设计，多次一举。正常，此处只是说明if语句的跳转方式。      
      
那么对于for呢？我们在回顾一下摸一下的故事。 
    for (黑白写0; 老板判断黑板是否小于100；老板在黑板上加1）{ 
        摸狗一次; 
    }

为了简化for摸狗一次我们修改model.c文件如下 

{% highlight c %}
#include <stdio.h>
static void param_done(void){
    printf("param_done func !\n");
    return;
}
static void param_exit(void){
    int i;
    printf("param_exit func !\n");
    for (i = 0; i < 100 ; i++){
        printf("touch the dog! \n");
    }
    return;
}
void model(int flag){
     if (flag){
         param_done();
     }else{
         param_exit();//printf("model func flag == 0\n");//此处增加一个判断测试点
     }    
     return;
}
{% endhighlight %}

修改attr.c如下

{% highlight c %}
#include <stdio.h>
#include <string.h>
#include "view.h"
#include "control.h"
#include "model.h"
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

    control(control_mode);
    
        model(0);
        view(view_mode);
    
    return 0;
}
{% endhighlight %}

使用gcc编译，链接。运行 
    ./attr ./attr.c1 （确保rm 掉了attr.c1 ,使得该文件不存在） 
此时，你会发现有很多printf信息，touch the dog！。证明目前我们for确实运转良好。 那么反汇编，param_exit函数如下  

{% highlight asm %}
00000014 <param_exit>: 
  14:    b580          push    {r7, lr} 
  16:    b082          sub    sp, #8 
  18:    af00          add    r7, sp, #0 
  1a:    f240 0000     movw    r0, #0 
  1e:    f2c0 0000     movt    r0, #0 
  22:    f7ff fffe     bl    0 <puts>   //到此为止，是打印函数测试点 
  26:    f04f 0300     mov.w    r3, #0 //for 中的 i = 0,i的存储位置为r3这个寄存器 
  2a:    607b          str    r3, [r7, #4]  //把i这个值保存到堆栈中， 
  2c:    e009          b.n    42 <param_exit+0x2e> //跳一下到 42(16进制）位置 
  2e:    f240 0000     movw    r0, #0   //循环在这里开始 哦 。。。 
  32:    f2c0 0000     movt    r0, #0 
  36:    f7ff fffe     bl    0 <puts> 
  3a:    687b          ldr    r3, [r7, #4]  //取出i 
  3c:    f103 0301     add.w    r3, r3, #1 //加一下 
  40:    607b          str    r3, [r7, #4]  //保存起来 
  42:    687b          ldr    r3, [r7, #4]  //2c位置会跳过来的，哦。取出i准备比较 
  44:    2b63          cmp    r3, #99    ; 0x63 //和99做比较啦。 
  46:    ddf2          ble.n    2e <param_exit+0x1a> //如果小于等于则跳进循环运行 
  48:    f107 0708     add.w    r7, r7, #8 
  4c:    46bd          mov    sp, r7 
  4e:    bd80          pop    {r7, pc}
{% endhighlight %}

现在对for 语言有了理解吧。for语句，有三个部门 i = 0是个初始化， i < 100是比较判断跳转，i++是每次循环完毕后，再下一次比较前进行的操作。你完全可以从上述汇编中理解。 别以为 i++放在 for()里，就会先执行。这里说个非常“奇怪的例子”，希望强调两点
1. for()里面不是一定什么都要写的，语法规则，可以完全空着。 
2. 用goto来描述一下for 怎么实现。 

{% highlight c %}
static void param_exit(void){
    int i;
    printf("param_exit func !\n");
LABEL_for_init_param_exit:    
    i = 0;
    goto LABEL_for_check_param_exit;
    for ( ; ; ){
LABEL_for_begin_param_exit:
    printf("touch the dog! \n");
LABEL_for_adjust_param_exit:
    i++;
LABEL_for_end_param_exit:        
LABEL_for_check_param_exit:
        if (i < 100){
            goto LABEL_for_begin_param_exit;
        }else{
        
        }    
    }
    
    return;
    goto LABEL_for_init_param_exit;
    goto LABEL_for_end_param_exit;
    goto LABEL_for_adjust_param_exit;
}
{% endhighlight %}

使用gcc 编译，链接。 运行 
    ./attr ./attr.c1 (rm attr.c1) 
不好意思，上面的代码，有错误。你会发现你的程序有死循环。不用紧张。电脑不值钱，即便程序运行导致你的电脑主板一阵青烟后再也无法启动，也没关系。重要的是数据，如我对上述所有代码均上传到perforce上（一种版本管理器）一样，你要保持良好习惯，每做一小步的开发，就要做次测试验证，验证正确，立刻备份保存。 

出错的原因，先不谈。至少编译通过了。也即 for (;;)没有什么大不了的。语法支持什么都不写。当然意思也很确定，就是死循环。 

鬼话：死循环绝对不是错误，仅是一种逻辑表现。你所使用的电脑操作系统里，到处都有死循环。只有当配合死循环的逻辑缺失时，整体才是错误。很多设计原理，都依赖死循环的存在。 

那么这里缺失了一个明显的逻辑，也即 i >= 100 时，我们需要跳转。因此代码修改如下：

{% highlight c %}
static void param_exit(void){
    int i;
    printf("param_exit func !\n");
LABEL_for_init_param_exit:    
    i = 0;
    goto LABEL_for_check_param_exit;
    for ( ; ; ){
LABEL_for_begin_param_exit:
    printf("touch the dog! \n");
LABEL_for_adjust_param_exit:
    i++;
LABEL_for_end_param_exit:        
LABEL_for_check_param_exit:
        if (i < 100){
            goto LABEL_for_begin_param_exit;
        }else{
            goto LABEL_return_param_exit;
        }    
    }
LABEL_return_param_exit:    
    return;
    goto LABEL_for_init_param_exit;
    goto LABEL_for_end_param_exit;
    goto LABEL_for_adjust_param_exit;
}
{% endhighlight %}

再次编译链接运行，对比上次输出，看是否一致了。而当你注释掉 ，for(;;),余下的代码才对应 
{% highlight c %}
for (i = 0; i < 100 ;i++){
    printf("touch the dog!\n");
}
{% endhighlight %}
的逻辑。 我们去掉for(;;)后，获取反汇编如下：

{% highlight asm %}
00000014 <param_exit>: 
  14:    b580          push    {r7, lr} 
  16:    b082          sub    sp, #8 
  18:    af00          add    r7, sp, #0 
  1a:    f240 0000     movw    r0, #0 
  1e:    f2c0 0000     movt    r0, #0 
  22:    f7ff fffe     bl    0 <puts> 
  26:    f04f 0300     mov.w    r3, #0 
  2a:    607b          str    r3, [r7, #4] 
  2c:    e00a          b.n    44 <param_exit+0x30> 
  2e:    bf00          nop 
  30:    f240 0000     movw    r0, #0 
  34:    f2c0 0000     movt    r0, #0 
  38:    f7ff fffe     bl    0 <puts> 
  3c:    687b          ldr    r3, [r7, #4] 
  3e:    f103 0301     add.w    r3, r3, #1 
  42:    607b          str    r3, [r7, #4] 
  44:    687b          ldr    r3, [r7, #4] 
  46:    2b63          cmp    r3, #99    ; 0x63 
  48:    ddf1          ble.n    2e <param_exit+0x1a> 
  4a:    bf00          nop 
  4c:    f107 0708     add.w    r7, r7, #8 
  50:    46bd          mov    sp, r7 
  52:    bd80          pop    {r7, pc}
{% endhighlight %}

和 if else 的类似，只是多了点nop。因此，你需要注意我对 LABEL_for_XXX 的定义。实际的每次循环结束前有了i++的工作。而任何循环没有开始前，已经做了初始化和检测条件的工作。 

同时，我特意将循环的外部写为LABEL_return_param_exit，此处更多的是想强调，这个位置，已经和for循环没有关系。算for循环的真正的外部。因为跳出循环，有两种，一种是跳出本次内循环（注意有个内字），C语言对应的是continue。一种是跳出当前for循环，C语言对应的是break。 

为了更好的说明continue ,和break，以及我非常希望你喜欢上goto（虽然很少用，但保持goto的思维）下面给出continue和break对应使用goto实现的方式。 

{% highlight c %}
static int test = 0;
static void param_exit(void){
    int i;
    printf("param_exit func !\n");
LABEL_for_init_param_exit:    
    i = 0;
    goto LABEL_for_check_param_exit;
    //for (i = 0; i < 100 ; i++){
    //for ( ; ; )
    {
LABEL_for_begin_param_exit:
    printf("touch the dog! \n");
LABEL_for_break_param_exit:    
    if (test == 0){
        goto LABEL_return_param_exit;
    }
LABEL_for_adjust_param_exit:
    i++;
LABEL_for_end_param_exit:        
LABEL_for_check_param_exit:
        if (i < 100){
            goto LABEL_for_begin_param_exit;
        }else{
            goto LABEL_return_param_exit;
        }    
    }
LABEL_return_param_exit:
    
    return;
    goto LABEL_for_break_param_exit;
    goto LABEL_for_init_param_exit;
    goto LABEL_for_end_param_exit;
    goto LABEL_for_adjust_param_exit;
}
{% endhighlight %}

编译，链接，运行（记得是输入参数文件名不存在的情况），你会发现只执行了一次。对应的break的代码如下：

{% highlight c %}
static void param_exit(void){
    int i;
    printf("param_exit func !\n");
    for (i = 0 ; i < 100; i++){
        printf("touch the dog! \n");
        if (test ==0){
            break;
        }
    }
    return;
}
{% endhighlight %}

你可以通过反汇编发现，仍然是只多了点nop。在没有写出continue做对比前，希望你关注下LABEL_for_break_param_exit的位置。 下面给出conitnue的用法。为了跟好的说明，我们增加了test存储区。model.c的整体内容如下：

{% highlight c %}
#include <stdio.h>
static void param_done(void){
    printf("param_done func !\n");
    return;
}
static int test = 0;
#if 1
static void param_exit(void){
    int i;
    printf("param_exit func !\n");
LABEL_for_init_param_exit:    
    i = 0;
    goto LABEL_for_check_param_exit;
    //for (i = 0; i < 100 ; i++){
    //for ( ; ; )
    {
LABEL_for_begin_param_exit:
    printf("touch the dog! \n");
LABEL_for_continue_param_exit:    
    if (test == 0){
        goto LABEL_for_adjust_param_exit;
    }
    test += 1;
LABEL_for_adjust_param_exit:
    i++;
LABEL_for_end_param_exit:        
LABEL_for_check_param_exit:
        if (i < 100){
            goto LABEL_for_begin_param_exit;
        }else{
            goto LABEL_return_param_exit;
        }    
    }
LABEL_return_param_exit:
    
    return;
    goto LABEL_for_continue_param_exit;
    goto LABEL_for_init_param_exit;
    goto LABEL_for_end_param_exit;
    goto LABEL_for_adjust_param_exit;
}    

#else
static void param_exit(void){
    int i;
    printf("param_exit func !\n");
    for (i = 0 ; i < 100; i++){
        printf("touch the dog! \n");
        if (test == 0){
            continue;
        }
        test += 1;
    }
    return;
}
#endif
void model(int flag){


     if (flag){
         param_done();
     }else{
         param_exit();//printf("model func flag == 0\n");//此处增加一个判断测试点
     }
         
     return;

}
{% endhighlight %}

你可以发现，除了多出的test相关内容，以及LABEL_for_break_XXX调整为 LABEL_for_continue_XXX等，还有个#if 1, #else #endif。 

\#if 和前面介绍的 #ifdef #ifndef 很像。 后面的表达式如入成立，则其到#else或#endif的内容，被预处理程序保留，否则被删除，不进行编译。因此上面 #if 1 实际是对第一个  param_exit函数进行处理，而你可以通过修改 #if 0来实现，对第二个函数的处理。否则，你要跟随我的例子，进行同一个函数，两个版本的切换，并生成对应的反汇编，你得不停的ctrl +c 和ctrl+v。 

鬼话：不要忽视这些宏操作的价值。当然我希望至少在你发现其某一个价值时，介绍给你。 扩展一下，参考#ifndef ，对应有个#ifdef。和#ifndef类似，就是解释相反。对于预处理程序发现如果定义了什么，则下面的需要进行编译处理。因此我们可以将上面的#if 1 修改如下 
    #ifdef LABEL_VER 
则表示，如果定义了LABEL_VER则LABEL版本的代码被编译。那么我们怎么保证这个能运行呢？有两种方法。 

1、静态的。你可以在这之前，增加 
    #define LABEL_VER 
没错，什么也没有，就是个噱头。 

2、动态的。我们在gcc 的参数里增加。如下 
    gcc -DLABEL_VER .....,现在你可以如下处理了。 
    arm-linux-gnueabi-gcc -DLABEL_VER -c model.c -o model.o 
此时生成了什么，你可以反汇编，并对照你前面的生成信息比较一下就可以。而此时，仅使用 `arm-linux-gnueabi-gcc  -c model.c -o model.o `，也可以在看一下，生成了。 

鬼话：并非我玩你，我一开始就这么用了，无非是希望你能发现这些用法的价值，因为他可以省去很多代码文本的操作。 

-D的使用方法就不多说了，根据参考文献4可以获得全面的信息。不要觉得其他高级语言有多牛，也不要觉得命令行下的gcc有多弱，其实都一样，当你在IDE（集成开发环境里），对配置点来点去，还不知道为什么点，仅是书本说应该这样时，为什么不考虑通过参考文献4来明确知道每个动作的含义呢？ 

鬼话：为什么C语言的非IDE的开发方式要学这么多？很简单，知其所以然，则可以不求人，只知其然，出了问题，自然不知其所以然。 

回到continue的讨论，需要注意，continue是跳过当前内循环，意味着，i++这种adjust的操作，仍然需要执行。这是和break最大的区别。因为break直接跳出一个循环，而不会追加adjust部分的执行。利用这个特性，因此也经常在代码中通过检测调整量来判断是否循环检测到你想要的东西。一个C代码的模板如下：

{% highlight c %}
for (i = 0 ; i < 100 ; i++){
    if (官府来抓虐待动物者）{
        break;
    }
    摸狗一下；
}
if (i >= 100){
    很爽，摸了100下。
}else{
    城管来了，没摸够100下。
}
{% endhighlight %}

但需要注意，下面写法的区别 

{% highlight c %}
for (i = 0 ; i < 100 ; i++){
    摸狗一下；
    if (官府来抓虐待动物者）{
        break;
    }    
}
if (i >= 100){
    很爽，摸了100下。
} else {
    if (i == 99){
        嘿嘿，还好，摸完了100下,差点被抓
    }else{
        城管来了，没摸够100下。
    }
}
{% endhighlight %}

特别是我们对一个连续逻辑空间内（不代表实际连续存储在一起）进行查找，一旦找到就OK的逻辑，用上面的方法就可以判断到是否找到了。你可以尝试写一些真实的代码。 

跳转，在C里面，其实还有一个标准的动作。就是我们一早介绍的return。说return和goto的区别，不妨你自己参考文献1。需要注意的是6.8.6.2.2，这个三个比较需要好好看看，特别是我介绍完while 和do{}while之后。 

先说goto。你可以在标准中注意到，是局部跳转。也必须注意到一个小句子 ， **A goto statement shall not jump from outside the scope of  an identifer having a variably modified type to inside  the scope of that identifier**。 

我就不翻译了。如果看不懂，可以尝试做做国际标准里的范例。资料上有的，我尽量不重复，无非希望告诉你写重点。对应的一个C语言的重点概念是 scope，作用域，而在标准第一章就提到这个概念，可想而知他的重要性，而传统的教科书对这块有所欠缺，因此如果你想深入的学习标准而提升你的C编程水平，scope需要重点理解。 

但一个典型的推广就是，goto无法跳转到其他函数里。不过C的强大，不会另你无法作为。在C的标准库中提供了setjmp和longjmp，由此可以另你为所欲为的到处goto。 

鬼话：可能有些C语言老师要鞭笞我了。让初学者到处跳，甚至函数里面跳出去？你是误导人还是教育人。我只能说，拜托了传统教育，读书阶段我有几个想法用C都无法实现，至少弱智的处处加判断，处处做return。 

我们调整一下model.c代码如下：

{% highlight c %}
#include <stdio.h>
#include <setjmp.h>
jmp_buf context_buf;
static void param_done(void){
    printf("param_done func !\n");

    return;
}
static int test = 0;
static void param_exit(void){
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

void model(int flag){
     if (flag){
         param_done();
     }else{
         if (setjmp(context_buf) >= 10){
             printf("my god ,i escape!\n");
         }else{
             param_exit();//printf("model func flag == 0\n");//此处增加一个判断测试点
         }
     }
     return;
}
{% endhighlight %}

先不要考虑我printf中英语的水平。先着重看一下context_buf。我相信这个单词我并没有用错。意思是上下文的BUF。这里的上下文是什么意思呢？不得不从函数使用方式来描述。 

我们可以把CPU里的ALU单元，计算逻辑单元看做是个舞台上的灯光、音响等设备。那么对应很多寄存器和堆栈等等看作舞台的空间。一个函数的逻辑，看作一幕话剧。如果一个函数调用另一个函数，可以看作一幕场景剧情切换到另一幕场景。但是毕竟子函数处理完，原先的场景还要继续。怎么办？恢复啊。可以假设，model的函数落到flag == 0时，是你在向别人说过故事“想当年，你大哥我，在街上。。”，于是开始调用param_exit()函数。这个，舞台工作人员开始把现在的场景布置记录下来，随后开始布置param_exit的场景，还记得汇编里有一堆“编译套路”吗？例如 
{% highlight asm %}
14:    b580          push    {r7, lr} 
16:    b082          sub    sp, #8 
18:    af00          add    r7, sp, #0 
{% endhighlight %}
等等，其实还包括其他工作，比如 bl    0 <param_done> 这个动作，也就是调用当前函数的动作。 

等场景置换完毕，那么就开始演出你摸狗的桥段了。那么 `longjmp(context_buf,test);` 这是什么意思呢？很简单，穿越了。通常正常的函数，需要通过return  或执行到函数尾部，才会退出这个函数，于是场景再次重新恢复到你讲故事的环境。 return区别于 goto的一个重要作用就在于，可以返回到原先调用的指令位置的下一条指令，也就是说， return 是继续 “想当年，你大哥我，在街上 （此处省略XXX字param_exit函数），返回（场景重新回来），你看怎么样我牛吧“。而穿越呢？通常是  "想当年，你大哥我，在街上（此处省略XXX字param_exit函数），好悬啊，好悬啊，唉，你看城管追来没有？哦，我回来了。。吓死我了。。。“ 

但无论那种方式，你都需要重新布置场景。无非，穿越剧我们无法使用正常的return，则需要手工的保留上下文的内容，是哪些，这个和硬件以及编译器有关系，你目前只需要记得，用 setjmp(context_buf)来记录。但每次记录时，setjmp会返回0.因此，第一次运行时，会去讲解故事，调用 param_exit(); 

而在城管大喊一声“小子！你望哪里逃！”你的longjmp就会把context_buf的内容，迅速恢复到舞台上，也就是回到了一开是setjmp处的状况。于是，你身未动，已穿越。当然，longjmp的第二个参数是用于穿越时顺点东西回去，比如狗毛？或次数。而此时顺回去的东西，会作为setjmp的返回值。切记，切记，如果你为了向别人证明真的穿越了，多少顺点东西啊，无论什么，也都算古董啊。就怕你什么都没顺到，返回个0，完蛋了。继续穿吧。 

在不展开longjmp ,setjmp的利用介绍前，我们说下计算机执行指令的一个方式。很简单，有个寄存器，你完全可以看做是场记人员的本子。本子上是什么地址，就执行所指向的空间里的动作么。通常每执行一条指令，会对这个寄存器自动增加，以顺序执行下一条语句。而对于goto，则是表明，向那翻翻多少页，则自动就跳过去了。但是这可返回不了。而调用函数的跳转，除了写明向拿翻翻多少页，会额外在边上的一个小本子上写着，此处跳的。于是，return的作用啥？无非先找到这个小本子，再跳一下，这样自然就跳回原先的函数了。当然该场景切换的，还是要切换。这是call 调用函数，return 返回跳转，与goto的主要区别。 

展开讨论一下，longjmp ,setjmp的使用。太有用了。无非你做老师的习题用不上。因为考试，不是对，就是错。而工程上我们要能有包容错误的能力。如同我们发现有些逻辑有问题，则怎么办？丢弃掉，但不能导致整体模块退出。此时就在初始位置，setjmp一下，而发现出错，则longjmp到初始位置，继续该干什么干什么。但不代表循环重复啊。至少大话西游里，吴孟达多加了个“又”字。


上一篇：[从 MVC 开始模块化编程（下）](/candcpp/ghost-c-lang-3-3.html)

下一篇：[你这个“死”循环](/candcpp/ghost-c-lang-5.html)