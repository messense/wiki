---
layout: post
category: candcpp
title: 任意存储空间结构的设计
---

# 任意存储空间结构的设计

回顾上一篇最后，我们有一个易出错的设计，如下

{% highlight c %}
#define PARAM_STR0 "height"
#define PARAM_STR1 "width"
#define PARAM_STR2 "mode"
enum{
    HEIGHT_PARAM,
    WIDTH_PARAM,
    MODE_PARAM,
    MAX_PARAM
};
static int s_height_param;
static int s_width_param;
static int s_mode_param;
{% endhighlight %}

如果一不小心，把 HEIGHT_PARAM 对应的 PARAM_STR0 写成了 
	#define PARAM_STR0 "width" 
那么在做文本内容比较时，就会出错。这里拓展说下 
	#define STR "string" 
是什么。这是一个字符串的定义。如下代码 

{% highlight c %}
void test(void){ 
    printf("%s\n",STR); 
}
{% endhighlight %}

和

{% highlight c %}
void test(void){ 
    printf("%s\n","string"); 
}
{% endhighlight %}

一样 。此时，"string"，7个字符存储空间（不是6个），会作为一个常量的存储空间，存放在链接后的某个区域，而这个空间是编译过程申请的。你不必在意空间问题。其和
	const char str[] = "string";
很像。不一致的地方是，我们对str的使用更灵活。例如 
	const char str[] = "string"
在A这个C文件里声明。而另一个C文件B里有如下代码

{% highlight c %}
extern const char str[]; //这个通常放在和A同名的头文件里，被B这个C文件#include进来。 
void test(void){ 
    printf("%s\n",str); 
}
{% endhighlight %}

此时，str被看作外部一个常量的存储空间（你不能对这个空间里的内容进行修改），针对B这个C文件在编译时，并不会额外申请空间，而对于前面的例子 ，B这个文件可不管那么多，看见常量，直接分配个空间使用。 
回到前面的讨论，这里我们可以尝试使用struct这个C语言的语法声明。 struct的用法如下

{% highlight c %}
struct STRUCT_NAME{ 
    int i; 
    char c; 
    void *p; 
} struct_space;
{% endhighlight %}

这里是个例子，并不代表{ } 内一定要填写什么。同时 STRUCT_NAME表示一个存储组合的名称，而struct_space表示一个存储空间的名称。类似 char c ; char 表示一个存储类型，而c表示该存储类型的一个申请到的空间。而上述存储组合的类型是什么？ struct STRUCT_NAME; 

因此你还可以如下书写

{% highlight c %}
struct STRUCT_NAME{ 
... 
}; 
struct STRUCT_NAME struct_space;
{% endhighlight %}

由于这里有三个内容，存储组合的名称，存储类型，存储类型对应的空间的名称。因此存储组合的名称和存储类型对应的空间的名称没有必要不同。例如，如下的方法也是对的。不过在我的团队，谁这么写，踢谁出去。 

{% highlight c %}
struct S{ 
    char a; 
    int b; 
    char c[10]; 
}; 
struct S S;
{% endhighlight %}

那么我们如何访问到a或b呢。很简单。 如下

	S.a = 0; 
	S.b = S.a + 1;

你可以尝试 `printf("S.a is %d ; S.b is %d \n",S.a,S.b);` 测试一下。

S.a 和S.b都表示什么含义呢？ 

S我们知道是一个空间申请后对应的名称。由于这个空间内部的组织结构是在struct S这个类型声明里描述的。因此编译器并没有默认规则能确定。由此需要你明确提示，究竟使用这个里面的哪个具体空间。这和去拜访客户一样，某某局的某某处，甚至还有某某科室。 

那么 a ,b究竟存在这个组织空间里什么地方呢？这个和编译有关。通常，首先按顺序存放。其次，保证每个变量的存储边界至少按照寻址最小单元来存储。有些情况下，甚至按照对硬件或操作系统有利的方式存储。例如如果32位的系统下，我们将存储内容是32位对齐的。那么假设 S 的存储空间的首地址为 0x1000，那么 a也即存放在这里，但是b 并不存放在 0x1001这里，虽然a只要一个8位空间byte。因为这样会导致数据b在传递中，要读取两个 32位的空间，并进行移位的操作，所以 b通常直接存放在0x1004里，而0x1001 到0x1003这3个存储空间，无所谓，就浪费了。由此，你设计struct，需要注意以下几个习惯，当然都是鬼话，不存在必要性 ： 

1. 所有存储子内容，宽度越宽的，越放上面。例如 char c[10] ;那么就放在int b和char a前面。 
2. 对于任意存储子内容，坚持至少使用32位宽。例如 char c[10]就应该定义成 char c[12]; 
3. 除了用于存储空间收集目的，否则，struct的内容不要太多。尽可能的明确每个struct的逻辑，保证内部的子内容之间存在很强的逻辑关联。 

关于第3点，展开讨论一下。例如我们我们定义个坐标，(x,y)，每个坐标上有，space_mode（空间类型），space_size(空间尺寸）等4个信息。则使用

{% highlight c %}
struct COOR{ 
    int x; 
    int y; 
}; 
struct SPACE{ 
    int space_mode; 
    int space_size; 
}; 
struct SPACE_ALL{ 
    struct COOR coor; 
    struct SPACE space; 
}; 
比 
struct SPACE_ALL{ 
    int x; 
    int y; 
    int space_mode; 
    int space_size; 
};
{% endhighlight %}

要好很多。虽然存储 组织上一样。因为，x,y的逻辑关联更紧密。而x 和 space_size并没有什么对等关联。这样可以保证你对上述空间操作的代码设计，逻辑更简单，描述更清晰，代码利用率也提高。 

我上面说了一个收集，这个意思是，当我们存在很多存储空间申明时，我们希望这些存储空间能够集中存放。例如 value.c中有

{% highlight c %}
int g_status; 
char *g_pmodel ; 
char *g_pcontrol_input;
{% endhighlight %}

这三个全局存储空间声明。我们可以如下操作，在value.h中增加

{% highlight c %}
struct GLOBAL{ 
    int status; 
    char *pmodel ; 
    char *pcontrol_input; 
}; 
extern struct GLOBAL global;
{% endhighlight %}

而对应的 extern char *g_pmodel;等等都可以删除。 而在value.c 里可以直接写一个 
	GLOBAL global; 

现有可能你还看不出好处。记得我们对每个全局存储空间的新增时都要做以下几步 

1. 在value.c下，写出该空间的声明，例如 char *g_pmodel; 
2. 在value.h下，写出extern char *g_pmodel; 
3. 必要时，对应其他C文件，需要#include "value.h" 

而现在，你可以把1，2两项的工作，缩减为一个工作。 在value.h的 struct GLOBAL内增加 char *pmodel；就可以了。 

别小看只是省了这一步，实际工作中，少一步就少了一个可能的出错点。此处的少，和把简单的事情搞复杂不矛盾，为啥？自己想。而需要很注意的是，这里为什么可以少了一步？是因为，struct的收集方式，针对一类空间申请是有同样的逻辑描述，例如，需要在.h文件里extern声明一下，需要在value.c申请一下。由此，这个收集方式，当struct里有一个存储单元被正确验证过，其他存储单元，涉及到上述步骤，也就自然可正确完整。 

>鬼话：人为的书写和设计，难免有错误。一个好的设计方法，包含了降低人为失误的机理或机制。 

struct还有另外一种写法，其实你在参考文献1的 6.7.2.1中可以找到详细内容。我们给出下面一个写法

{% highlight c %}
typedef struct { 
    int a; 
    char b; 
}GLOBAL;
{% endhighlight %}

意思是 将 `struct { int a ; char b ; }` 这个类型定义为 GLOBAL。此时GLOBAL直接就是一个具体的存储类型了，无非是自定义的存储结构。包含了 int a ;和char b;两个存储空间。这样的好处如下： 

{% highlight c %}
struct S s1; 
GLOBAL g;
{% endhighlight %}
显然下面的方式更清晰。同时，S本身并不是一个类型名。所以，你可以
{% highlight c %}
struct S S;
{% endhighlight %}
而GLOBAL 是一个被编译器认可的类型名（由typedef导致）。此时 GLOBAL GLOBAL;就是非法的了。 

>鬼话：约束，有时对你是种帮助。上述struct S S;的书写方式很容易搞混代码文本的逻辑理解。 

这里联合前面说的指针讨论一下。我们需要一个存储空间，里面存在的一个值，这个值指向一个地址，对应的空间是一个自定义的存储结构。那么我们可以

{% highlight c %}
GLOBAL *pG; 
(*pG).a = 0; 
(*pG).b = 1;
{% endhighlight %}

>鬼话： 为什么加()，因为我记不得谁的优先级更高。*还是.。这不是丢脸的事情，甚至我可以强制保持逻辑描述的争取性。比查资料，或者背考试答卷有效的多。相信我，学校C语言考试如果出现优先级的考题，无非是因为出题者缺乏工程开发经验导致没有更有价值的题目而凑数字的出。实际工程中，即便再有经验的工程师，对于优先级，仍然会保持()的心态，进行确认，因为有些古怪的符合标准的书写，对于不同的编译器可能有不同的实际执行。没有必要纠结这些形而上学的东西，安心加()，不会累死机器的。 

C语言，提供了个更好的书写方式，完成上述(*pG).a等的操作。如下： 

{% highlight c %}
pG->a = 0; 
pG->b = pG->a + 1;
{% endhighlight %}

这样写，表示无论是对空间的读利用，还是空间的写利用，那么这样操作都可以。实际pG->a完成了什么？我们做个测试。以下给出control.c的清单，注意新添部分

{% highlight c %}
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include "define_attr.h"
#include "control.h"
#include "value.h"

typedef struct{
    int height;
    int width;
    int mode;
}PARAM_S, *P_PARAM_S;
static PARAM_S s_param;
static P_PARAM_S s_pparam_test = &s_param;
#define GET_FILE_SIZE(size,fp) do {long int pos = ftell(fp); fseek(fp,0L,SEEK_END);size = ftell(fp);fseek(fp,pos,SEEK_SET);}while(0)
char filename[1024];
static long int buf_num = 0;
#define TOKEN_MAX_NUM 10
static char *s_ptoken_pos[TOKEN_MAX_NUM];

#define dNEXT_LINE 0xa
#define dRETURN 0xd    
#define dSPACE_KEY 0x20
#define dTAB_KEY 0x9
#define CHECK_ALPHA(c) (((c) != dSPACE_KEY) && ((c) != dTAB_KEY))
#define CHECK_LINES(p,i,lines) do {lines += (p[i] == dNEXT_LINE);}while (0)

#define PARAM_MAX_NUM 3
static int split_token(char *pline,char *ppos[]);
static int check_grammar(int argc,char *argv[]);
static int set_param(int mode,int value);
static int print_param(void);
static int split_line(char *pbuf){
    int i;    
    int lines = 0;
    char *pline = pbuf;
    __PRINT_FUNC();
    i = 0;
    while (i < buf_num){
        CHECK_LINES(pbuf,i,lines);
        if (pbuf[i] == dNEXT_LINE){
            int tokens;
            pbuf[i] = 0;
            printf("%s \n",pline);
            tokens = split_token(pline,s_ptoken_pos);
            printf("%d\n",tokens);
            //printf("check return %d\n",
            check_grammar(tokens,s_ptoken_pos);
            pline = pbuf + i+1; 
        }else  if (pbuf[i]  == dRETURN){
            pbuf[i] = 0;
            pline = pbuf+i+1;
        }
        i++;
    }
       print_param();
    printf("the lines is %d\n",lines);
    return 0;
}    
static int split_token(char *pline,char *ppos[]){
    int tokens = 0;
    __PRINT_FUNC();
    while ((*pline)&&(tokens < TOKEN_MAX_NUM)){
        if (CHECK_ALPHA(pline[0])){
            ppos[tokens++] = pline;
                        pline++;
            while (CHECK_ALPHA(pline[0])){
                if (pline[0] == 0){
                    goto LABEL_return_split_token;
                }
                pline++;
            }            
        }
        pline[0] = 0;
        pline++;
    }
    
LABEL_return_split_token:
    printf("the tokens is %d !\n",tokens);    
    return tokens;
}
#define PARAM_STR0 "height"
#define PARAM_STR1 "width"
#define PARAM_STR2 "mode"
enum{
    HEIGHT_PARAM,
    WIDTH_PARAM,
    MODE_PARAM,
    MAX_PARAM
};
static int print_param(void){
    int a =0;
    printf("only test %d\n",a);
    printf("%s -> %d\n",PARAM_STR0,s_param.height);
    printf("%s -> %d\n",PARAM_STR1,s_param.width);
    printf("%s -> %d\n",PARAM_STR2,s_pparam_test->mode);
    return 0;
}
static int check_grammar(int argc,char *argv[]){
    int value;
    int mode = -1;
    __PRINT_FUNC();
    if (argc != 3){
        return 1;
    }
    if ((strcmp(argv[0],PARAM_STR0) == 0)){
        mode = 0;
    }else if ((strcmp(argv[0],PARAM_STR1) == 0)){
        mode = 1;
    }else if ((strcmp(argv[0], PARAM_STR2) == 0)){
        mode = 2;
    }else {
        return 2;
    }
    if (strcmp(argv[1],"=") != 0){
        return 3;
    }
    value = atoi(argv[2]);
    set_param(mode,value);
    return 0;
}
static int set_param(int mode,int value){
    __PRINT_FUNC();
    switch (mode){
        case HEIGHT_PARAM: s_param.height = value;
         //printf("%s -> %d\n",PARAM_STR0,value);
        break;
        case WIDTH_PARAM: s_param.width = value;
        // printf("%s -> %d\n",PARAM_STR1,value);
         break;
        case MODE_PARAM:s_param.mode = value;
        //printf("%s -> %d\n",PARAM_STR2,value);
         break;
        default:
            printf("mode is error!\n");
    }
    return 0;
}
static void read_param_default(void){
    __PRINT_FUNC();
    return;
}
static int read_param_from_file(char * filename){
    FILE *fp;
    long int file_size;
    long int read_size;
    __PRINT_FUNC();
    fp = fopen(filename,"rt");
    if (fp == 0) return 1;
    GET_FILE_SIZE(file_size,fp);
    if (file_size >= CONTROL_INPUT_SIZE){
        fclose(fp);
        return 2;
    }
    buf_num = read_size = fread(g_pcontrol_input,sizeof(char),file_size,fp);
    g_pcontrol_input[buf_num] = 0;
    printf("file size is %ld,read is %ld !\n",file_size,read_size);
    fclose(fp);
    return split_line(g_pcontrol_input);
}

void control(int flag){
    if (flag){
        read_param_from_file(filename);
    }else{
        read_param_default();
    }
    return;
}
{% endhighlight %}

由于前面测试的正确，所以我们果断将set_param里的测试注释掉。并在 split_line 后，统一打印出每个参数的信息。而此时各个参数已经被收集到s_param里。注意 `typedef struct { ...} PARAM_S ,*P_PARAM_S;` 这里实际上申明了两个类型，后一个是指针类型，其对应空间里存放的值，指向上述符合结构体逻辑关系的存储空间。 
   
我们反汇编看看 s_param.height 和s_param_test->mode都有什么不同。对应的链接后的反汇编，如下 

{% highlight asm %}
00008850 <print_param>: 
    8850:    b580          push    {r7, lr} 
    8852:    af00          add    r7, sp, #0 
    8854:    f249 03f0     movw    r3, #37104    ; 0x90f0 
    8858:    f2c0 0300     movt    r3, #0 
    885c:    f241 4220     movw    r2, #5152    ; 0x1420 
    8860:    f2c0 0201     movt    r2, #1 
    8864:    6812          ldr    r2, [r2, #0] 
    8866:    4618          mov    r0, r3 
    8868:    4611          mov    r1, r2 
    886a:    f7ff ee66     blx    8538 <_init+0x2c> 
    886e:    f249 1300     movw    r3, #37120    ; 0x9100 
    8872:    f2c0 0300     movt    r3, #0 
    8876:    f241 4214     movw    r2, #5140    ; 0x1414 
    887a:    f2c0 0201     movt    r2, #1 
    887e:    6812          ldr    r2, [r2, #0] 
    8880:    4618          mov    r0, r3 
    8882:    f249 110c     movw    r1, #37132    ; 0x910c 
    8886:    f2c0 0100     movt    r1, #0 
    888a:    f7ff ee56     blx    8538 <_init+0x2c> 
    888e:    f249 1300     movw    r3, #37120    ; 0x9100 
    8892:    f2c0 0300     movt    r3, #0 
    8896:    f241 4214     movw    r2, #5140    ; 0x1414 
    889a:    f2c0 0201     movt    r2, #1 
    889e:    6852          ldr    r2, [r2, #4] 
    88a0:    4618          mov    r0, r3 
    88a2:    f249 1114     movw    r1, #37140    ; 0x9114 
    88a6:    f2c0 0100     movt    r1, #0 
    88aa:    f7ff ee46     blx    8538 <_init+0x2c> 
    88ae:    f249 1300     movw    r3, #37120    ; 0x9100 
    88b2:    f2c0 0300     movt    r3, #0 
    88b6:    f241 32fc     movw    r2, #5116    ; 0x13fc 
    88ba:    f2c0 0201     movt    r2, #1 
    88be:    6812          ldr    r2, [r2, #0] 
    88c0:    6892          ldr    r2, [r2, #8] 
    88c2:    4618          mov    r0, r3 
    88c4:    f249 111c     movw    r1, #37148    ; 0x911c 
    88c8:    f2c0 0100     movt    r1, #0 
    88cc:    f7ff ee34     blx    8538 <_init+0x2c> 
    88d0:    f04f 0300     mov.w    r3, #0 
    88d4:    4618          mov    r0, r3 
    88d6:    bd80          pop    {r7, pc}
{% endhighlight %}

注意一下： 

    8876:    f241 4214     movw    r2, #5140    ; 0x1414 
    887a:    f2c0 0201     movt    r2, #1 
    887e:    6812          ldr    r2, [r2, #0] 
    ================== 
    8896:    f241 4214     movw    r2, #5140    ; 0x1414 
    889a:    f2c0 0201     movt    r2, #1 
    889e:    6852          ldr    r2, [r2, #4] 
    ================== 
    88b6:    f241 32fc     movw    r2, #5116    ; 0x13fc 
    88ba:    f2c0 0201     movt    r2, #1 
    88be:    6812          ldr    r2, [r2, #0] 
    88c0:    6892          ldr    r2, [r2, #8] 
    ================== 

这三块，我猜也能猜出来，就是处理 s_param.height，s_param.width ,s_param_test->mode的工作。你问我，你怎么猜不出来，其实这没什么学问，只是个经验的问题。或许你工作个几个月，就也能猜出来了。 （注：以上具体的地址，可能根据你的机器环境有所不同。重点的是哪些指令和寄存器如 movw r2,#xxxx, ldr r2,[r2,#0]等） 

这里不强调谁能猜出来，我们看区别。 前面两次，对r2 设置都是相同，表示都是一个存储空间里的地址。而 ldr r2,[r0,#XX],这个XX不同。一个0，一个是4。为什么？我们回顾下PARAM_S的定义， 
{% highlight c %}
typedef struct{ 
    int height; 
    int width; 
    int mode; 
}PARAM_S; 
PARAM_S s_param;
{% endhighlight %}

自然，height存放在这个空间的最起始的地方，由于是32位，所以width对应的是偏移4的位置。那么第三块，后面一个语句和前面和很像，而且我们知道是取s_param这个空间里偏移8的位置的，也即mode的内容。但你会发现多了一次 ldr。 

ldr r2,[r2,#0] 就是 s_pparam_test的操作，将其存储空间里的值取出来，存放到r2中。这本身就是s_param的地址。由于s_param的实际地址是链接器设置，因此，对于s_param的操作，就不需要ldr了，直接用 movw这样指令，对r2直接设置值就可以了。 

ldr r2,[r2,#8]，这和前面通过 ldr r2,[r2,#4]取出s_param里width一样，无非是取出mode。而我特地加上了一个测试代码，对buf_num进行打印操作。你可以注意一下 

    885c:    f241 4220     movw    r2, #5152    ; 0x1420 
    8860:    f2c0 0201     movt    r2, #1 
    8864:    6812          ldr    r2, [r2, #0] 

这表示什么含义呢？一个存储空间的访问，和一个自定义的存储结构体空间里的单元访问并没有什么指令操作上的区别。如

    8864:    6812          ldr    r2, [r2, #0] //buf_num 
    887e:    6812          ldr    r2, [r2, #0]//s_param.height 
    887e:    6812          ldr    r2, [r2, #4]//s_param.widht 

所以千万别人为s_param.height多了个.操作，就会导致计算逻辑变复杂了。这是因为编译器可以实现算出结构体内各个单元在这个整体存储空间内的值。 

那么，我们自己怎么显示的获取这些值呢？以下，给出一个C的#define

	#define __BIAS_STRUCT(type,member) (unsigned long)&(((type *)0)->member)

那么我们将print_param修改如下

{% highlight c %}
#define __BIAS_STRUCT(type,member) (unsigned long)&(((type *)0)->member)
static int print_param(void){
    printf("%s(%ld) -> %d\n",PARAM_STR0,__BIAS_STRUCT(PARAM_S,height),s_param.height);
    printf("%s(%ld)-> %d\n",PARAM_STR1,__BIAS_STRUCT(PARAM_S,width),s_param.width);
    printf("%s(%ld) -> %d\n",PARAM_STR2,__BIAS_STRUCT(PARAM_S,mode),s_pparam_test->mode);
    return 0;
}
{% endhighlight %}

你可以编译链接，运行看一下，是否还有如下内容： 
    
    height(0) -> 3 
    width(4)-> 5 
    mode(8) -> 1 

我们分析一下上面的一定。如果给入PARAM_S ,和height这两个内容，则 `__BIAS_STRUCT(PARAM_S,height)` 被替换为  `(unsigned long)&(((PARAM_S *)0)->height) `

从()的最里面看。 (PARAM_S *) 0，这是将0强制转换为 `(PARAM_S*)，((PARAM_S *)0)->height` 是取一个PARAM_S的类型结构的存储空间里height的单元。`&(((PARAM_S *)0)->height)` 是将这个单元的对应地址取出来。`(unsigned long)`是将这个地址强制转换为正整数。由于整个存储空间，是以0地址为起始，所以&(((PARAM_S *)0)->height)取出来的数减去0，自然是这个height在整个结构体内的偏移位置。我们可以反汇编看下，机器都怎么操作的。 

你可以注意到有以下代码，你忽略你的机器上的绝对地址。

    8864:    6814          ldr    r4, [r2, #0] 
    8866:    4618          mov    r0, r3 
    8868:    f249 01f8     movw    r1, #37112    ; 0x90f8 
    886c:    f2c0 0100     movt    r1, #0 
    8870:    f04f 0200     mov.w    r2, #0 
    8874:    4623          mov    r3, r4 
    8876:    f7ff ee60     blx    8538 <_init+0x2c>     

由于我们 `printf("%s(%ld) -> %d\n",PARAM_STR0,__BIAS_STRUCT(PARAM_S,height),s_param.height);` 的参数改动。所以 `__BIAS_STRUCT(PARAM_S,height)` 最终的值存放在r2,原先r2中存放的s_param.height被挪到r3中。 

此时，    8870:    f04f 0200     mov.w    r2, #0 ，表示编译器对上述复杂的定义 `(unsigned long)&(((PARAM_S *)0)->height)` 直接计算出了结果。 

>鬼话：这样做有啥好处？你去看看linux内核中涉及list的相关源代码，就知道了。别怀疑，那些世界顶级的C工程师，写出的代码，实际你现在也能写出。无非你的经验不足，尚不能灵活应用。这里送很多新手一句张狂的话，“当你抬头景仰所谓高手，牛人时，你已经输，再牛也是人，没必要怀疑他们使用了某种你没有权利使用的高端设计方法” 

这里需要再重复的说明一下。 
    #define __BIAS_STRUCT(type,member) (unsigned long)&(((type )0).member) 
是不对的。我们从另一个角度来解释。 (type)a表示，a是个存储空间。我们对a里面的值，或某个具体的值，逻辑上（必要时，机器指令有新增动作保证逻辑正确）进行转换。例如你可以看作有符号，或无符号。这对后期计算的逻辑有作用。例如 
{% highlight c %}
signed char sc; 
unsigned char uc; 
sc = (signed char)127; 
uc = (unsigned char)sc; 
sc++; 
uc++;
{% endhighlight %}

此时，sc里等于0，而uc里等于128.不信你打印试试。 `uc = （unsigned char)sc; `表示取出sc里的值，强制转换为无符号char类型，存储到uc里。 `sc= (signed char)127;`表示，对127这个值，强制转换为有符合char类型，存储到sc里。 而(type ) 0，表示什么意思？将0，按照type的类型来理解。如果type是 PARAM_S，如下 `s = (PARAM_S)0;` 充其量是对s进行全部设置0的操作。此时就是有作用，也只是保存到一个PARAM_S的存储空间里。而我们要的是门牌号码，不是家里的东西。因此 0应该我们设想的是对某个PARAM_S的存储空间的地址的描述。因此自然是（PARAM_S *)0，即，将0作为一个地址，这个地址，指向一个PARAM_S类型的存储空间。那么 `&((PARAM_S *)0->height)` 自然是对存储在0这个地址，我们看做PARAM_S类型的存储空间里，height这个单元的取地址操作。 

这有还有什么用？我们回顾一下开头说的易出错的问题。我们如何保证"height"和 s_param.height 对应呢？以下给出一个打击学院派，坚决不用switch的设计方法。好处后面提。先把control.c的完整代码列出，注意新增部分和注释掉的部分

{% highlight c %}
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include "define_attr.h"
#include "control.h"
#include "value.h"

typedef struct{
    int height;
    int width;
    int mode;
    float testf;
}PARAM_S, *P_PARAM_S;
static PARAM_S s_param;
static P_PARAM_S s_pparam_test = &s_param;
#define PARAM_MAX_NUM 4
#define __BIAS_STRUCT(type,member) (unsigned long)&(((type *)0)->member)
#define __BIAS_PARAM(member) __BIAS_STRUCT(PARAM_S,member)
#define __SET_BIAS(type,ps,bias) *(type *)((void *)(ps) + bias)
#define PARAM_STR_MAX_SIZE 20

enum{
    _INT_MODE,
    _FLOAT_MODE,
    _MAX_MODE
};
typedef struct{
    char *str;
    unsigned long bias;
    char* default_value;
    int type;
}PARAM_TAB_S;
typedef PARAM_TAB_S * P_PARAM_TAB_S;


const static PARAM_TAB_S c_param_tab[PARAM_MAX_NUM] = {
{"width",__BIAS_PARAM(width),"0",_INT_MODE},
{"height",__BIAS_PARAM(height),"0",_INT_MODE},
{"mode",__BIAS_PARAM(mode),"0",_INT_MODE},
{"ftest",__BIAS_PARAM(testf),"1.0f",_FLOAT_MODE}
};
typedef  void (*_SET_FUNC)(unsigned long ,char *) ;
static void set_int_param(unsigned long bias,char *s){
    __SET_BIAS(int,s_pparam_test,bias) = atoi(s);
}
static void set_float_param(unsigned long bias,char *s){
    __SET_BIAS(float,s_pparam_test,bias) = (float)atof(s);
}
_SET_FUNC set_param_func[_MAX_MODE] = {set_int_param,set_float_param};


#define GET_FILE_SIZE(size,fp) do {long int pos = ftell(fp); fseek(fp,0L,SEEK_END);size = ftell(fp);fseek(fp,pos,SEEK_SET);}while(0)
char filename[1024];
static long int buf_num = 0;
#define TOKEN_MAX_NUM 10
static char *s_ptoken_pos[TOKEN_MAX_NUM];

#define dNEXT_LINE 0xa
#define dRETURN 0xd    
#define dSPACE_KEY 0x20
#define dTAB_KEY 0x9
#define CHECK_ALPHA(c) (((c) != dSPACE_KEY) && ((c) != dTAB_KEY))
#define CHECK_LINES(p,i,lines) do {lines += (p[i] == dNEXT_LINE);}while (0)


static int split_token(char *pline,char *ppos[]);
static int check_grammar(int argc,char *argv[]);
//static int set_param(int mode,int value);
static int print_param(void);
static int split_line(char *pbuf){
    int i;    
    int lines = 0;
    char *pline = pbuf;
    __PRINT_FUNC();
    i = 0;
    while (i < buf_num){
        CHECK_LINES(pbuf,i,lines);
        if (pbuf[i] == dNEXT_LINE){
            int tokens;
            pbuf[i] = 0;
            printf("%s \n",pline);
            tokens = split_token(pline,s_ptoken_pos);
            printf("%d\n",tokens);
            //printf("check return %d\n",
            check_grammar(tokens,s_ptoken_pos);
            pline = pbuf + i+1;
        }else  if (pbuf[i]  == dRETURN){
            pbuf[i] = 0;
            pline = pbuf+i+1;
        }
        i++;
    }
       print_param();
    printf("the lines is %d\n",lines);
    return 0;
}    
static int split_token(char *pline,char *ppos[]){
    int tokens = 0;
    __PRINT_FUNC();
    while ((*pline)&&(tokens < TOKEN_MAX_NUM)){
        if (CHECK_ALPHA(pline[0])){
            ppos[tokens++] = pline;
                        pline++;
            while (CHECK_ALPHA(pline[0])){
                if (pline[0] == 0){
                    goto LABEL_return_split_token;
                }
                pline++;
            }            
        }
        pline[0] = 0;
        pline++;
    }
    
LABEL_return_split_token:
    printf("the tokens is %d !\n",tokens);    
    return tokens;
}
#if 0
#define PARAM_STR0 "height"
#define PARAM_STR1 "width"
#define PARAM_STR2 "mode"
enum{
    HEIGHT_PARAM,
    WIDTH_PARAM,
    MODE_PARAM,
    MAX_PARAM
};
//#define __BIAS_STRUCT(type,member) (unsigned long)&(((type *)0)->member)
#endif
static int print_param(void){
    printf("s_param.height -> %d\n",s_param.height);
    printf("s_param.width -> %d\n",s_param.width);
    printf("s_param.mode -> %d\n",s_param.mode);
    printf("s_param.testf -> %f\n",s_param.testf);    
    return 0;
}
static int check_grammar(int argc,char *argv[]){
    int mode = -1;
    __PRINT_FUNC();
    if (argc != 3){
        return 1;
    }
    for (mode =0; mode < PARAM_MAX_NUM ; mode++){
        if (strcmp(argv[0],c_param_tab[mode].str) ==0) break;
    }
    if (mode >= PARAM_MAX_NUM){
        return 2;
    }
    if (strcmp(argv[1],"=") != 0){
        return 3;
    }
    set_param_func[c_param_tab[mode].type](c_param_tab[mode].bias,argv[2]);
    return 0;
}
#if 0
static int set_param(int mode,int value){
    __PRINT_FUNC();
    switch (mode){
        case HEIGHT_PARAM: s_param.height = value;
         //printf("%s -> %d\n",PARAM_STR0,value);
        break;
        case WIDTH_PARAM: s_param.width = value;
        // printf("%s -> %d\n",PARAM_STR1,value);
         break;
        case MODE_PARAM:s_param.mode = value;
        //printf("%s -> %d\n",PARAM_STR2,value);
         break;
        default:
            printf("mode is error!\n");
    }
    return 0;
}
#endif
static void read_param_default(void){
    int mode;
    __PRINT_FUNC();
    for (mode =0;mode < PARAM_MAX_NUM ; mode++){
        set_param_func[c_param_tab[mode].type](c_param_tab[mode].bias,c_param_tab[mode].default_value);
    }
    return;
}
static int read_param_from_file(char * filename){
    FILE *fp;
    long int file_size;
    long int read_size;
    __PRINT_FUNC();
    read_param_default();
    fp = fopen(filename,"rt");
    if (fp == 0) return 1;
    GET_FILE_SIZE(file_size,fp);
    if (file_size >= CONTROL_INPUT_SIZE){
        fclose(fp);
        return 2;
    }
    buf_num = read_size = fread(g_pcontrol_input,sizeof(char),file_size,fp);
    g_pcontrol_input[buf_num] = 0;
    printf("file size is %ld,read is %ld !\n",file_size,read_size);
    fclose(fp);
    return split_line(g_pcontrol_input);
}

void control(int flag){
    if (flag){
        read_param_from_file(filename);
    }else{
        read_param_default();
    }
    return;
}
{% endhighlight %}

以上我分段进行解释

{% highlight c %}
typedef struct{
    int height;
    int width;
    int mode;
    float testf;
}PARAM_S, *P_PARAM_S;
{% endhighlight %}

这里我们增加了一个float 类型的存储单元。无非是想证明这种方法对float的类型的参数也可以正确识别。 

   #define __SET_BIAS(type,ps,bias) *(type *)((void *)(ps) + bias)

是用于对一个结构体存储空间里的某个单元进行访问，而通过该单元在该整体的结构体内的偏移量位置决定。例如 width在PARAM_S的偏移量是4则 `__SET_BIAS(int,s_pparam_test,width)` 为 `*(int*)((void*)s_pparam_test + 4)`

{% highlight c %}
enum{
    _INT_MODE,
    _FLOAT_MODE,
    _MAX_MODE
};
{% endhighlight %}

这里枚举了两种类型，_MAX_MODE写出来的好处在于 `_SET_FUNC set_param_func[_MAX_MODE];` 对应的 `typedef  void (*_SET_FUNC)(unsigned long ,char *);` 就不说了。前面讲过函数指针类型的定义。 
这个函数指针数组的大小可以非常简单对应，且不会书写出错。

{% highlight c %}
typedef struct{
    char *str;
    unsigned long bias;
    char *default_value;
    int type;
}PARAM_TAB_S;
{% endhighlight %}

这是个针对参数分析的结构体。包含了，参数在文本文件中的名词，当前参数在PARAM_S的结构体内的偏移量，default_value 你可以从 read_param_default 函数被调用的位置发现用途。为什么我们的 config_attr 没有 testf，s_param.testf 还被设置了1。 

注意这些代码的设计:

{% highlight c %}
for (mode =0; mode < PARAM_MAX_NUM ; mode++){
    if (strcmp(argv[0],c_param_tab[mode].str) ==0) break;
}    
for (mode =0;mode < PARAM_MAX_NUM ; mode++){
    set_param_func[c_param_tab[mode].type](c_param_tab[mode].bias,c_param_tab[mode].default_value);
}
{% endhighlight %}

>鬼话：以上代码，算我自己的发明创造。我不介意，学院派又开始说，for循环里调用函数指针是多么的没效率。我指向说，在代码设计中，不出错，逻辑清晰，新增逻辑对应的新增代码量少，是开发效率。至于运行效率，那是整个设计逻辑正确，模块逻辑稳定后，优化的事情，优化和效率是两会事。如果诸位迷信学院派的说法，不放我们比试一下，下面的新增需求。 

假设我们PARAM_S，因为设计的新增，需要增加一个参数 vec(速度） ，类型是double。那么我需要改动的地方，有几个 

首先，参数的增加，修改 `#define PARAM_MAX_NUM 5` 和
{% highlight c %}
typedef struct{
    double vec;
    int height;
    int width;
    int mode;
    float testf;
}PARAM_S, *P_PARAM_S;
{% endhighlight %}

如果你跟随学院派，不知到把vec任意放某个位置，是否会导致额外的已有正确代码挪动。 其次，我们需要增加参数表的内容

{% highlight c %}
const static PARAM_TAB_S c_param_tab[PARAM_MAX_NUM] = {
    {"width",__BIAS_PARAM(width),"0",_INT_MODE},
    {"height",__BIAS_PARAM(height),"0",_INT_MODE},
    {"mode",__BIAS_PARAM(mode),"0",_INT_MODE},
    {"ftest",__BIAS_PARAM(testf),"1.0f",_FLOAT_MODE},
    {"vec",__BIAS_PARAM(vec),"5.02",_DOUBLE_MODE}
};
{% endhighlight %}

注意，这里并需要 将 vec的位置和PARAM_S里申明位置相同，此处放在了最后。 由于是double的处理。因此多了

{% highlight c %}
enum{
    _INT_MODE,
    _FLOAT_MODE,
    _DOUBLE_MODE,
    _MAX_MODE
};
{% endhighlight %}

并新增了函数

{% highlight c %}
static void set_double_param(unsigned long bias ,char *s){
    __SET_BIAS(double,s_pparam_test,bias) = atof(s);
}
{% endhighlight %}

同时扩建了函数指针的内容

{% highlight c %}
_SET_FUNC set_param_func[_MAX_MODE] = {set_int_param,set_float_param,set_double_param};
{% endhighlight %}

对应，很傻乎乎的学了学院派的一个书写方法，在print_param函数中增加了内容

{% highlight c %}
static int print_param(void){
    printf("s_param.height -> %d\n",s_param.height);
    printf("s_param.width -> %d\n",s_param.width);
    printf("s_param.mode -> %d\n",s_param.mode);
    printf("s_param.testf -> %f\n",s_param.testf);
    printf("s_param.vec -> %f\n",s_param.vec);        
    return 0;
}
{% endhighlight %}

其实正确的方式应当如下

{% highlight c %}
static int print_param(void){
    int mode;
    for (mode =0; mode < PARAM_MAX_NUM; i++){
        print_param_type[c_param_tab[mode].type](mode);
    }
}
{% endhighlight %}

使用函数指针进行调用打印。由于是打印，我就不搞那么复杂了。但是后果就是你没新增一个参数就得多写一次printf的内容。 

>鬼话：为什么新手写代码，一定逻辑复杂，或内容较多，就总是错来错去。是因为一开始，真把简单的事情搞简单了。当我们把简单的事情搞复杂，如 原先 直接 if 一个个用常量的比较方法，并在 set_param 中用switch一个个比较设置，这个看似简单，却不能让已有代码尽可能的被后续的新增逻辑复用。相信我，努力的琢磨如何让具备类似逻辑描述的代码，真正的实现同类描述，例如 `set_param_func[c_param_tab[mode].type](c_param_tab[mode].bias,c_param_tab[mode].default_value);` 或 `print_param_type[c_param_tab[mode].type](mode);`（此对应代码未写出） 将有助于你提升代码设计的效率。 

以下进一步，给出更极端的例子，不过属于少儿不宜，请勿模仿。 我们看一下

{% highlight c %}
static void set_double_param(unsigned long bias ,char *s){
    __SET_BIAS(double,s_pparam_test,bias) = atof(s);
}
static void set_int_param(unsigned long bias,char *s){
    __SET_BIAS(int,s_pparam_test,bias) = atoi(s);
}
static void set_float_param(unsigned long bias,char *s){
    __SET_BIAS(float,s_pparam_test,bias) = (float)atof(s);
}
{% endhighlight %}

他们有很多相似处。你将不相似的地方提出来如下

{% highlight c %}
static void set_X_param(unsigned long bias,char *s){
    __SET_BIAS(X,s_pparam_test,bias) = XX(s);
}
{% endhighlight %}

那么我们可以如下定义

{% highlight c %}
#define __FUNC_SET_PARAM(X,XX,XXX) static void set_##X##_param(unsigned long bias ,char *s){\
__SET_BIAS(X,s_pparam_test,bias) = XX(s);\
}
{% endhighlight %}

则上述的代码可以用以下的替换

{% highlight c %}
#if 1
#define __FUNC_SET_PARAM(X,XX) static void set_##X##_param(unsigned long bias ,char *s){\
__SET_BIAS(X,s_pparam_test,bias) = XX(s);\
}
__FUNC_SET_PARAM(double,atof)
__FUNC_SET_PARAM(int,atoi)
__FUNC_SET_PARAM(float,(float)atof)
#else
static void set_double_param(unsigned long bias ,char *s){
    __SET_BIAS(double,s_pparam_test,bias) = atof(s);
}
static void set_int_param(unsigned long bias,char *s){
    __SET_BIAS(int,s_pparam_test,bias) = atoi(s);
}
static void set_float_param(unsigned long bias,char *s){
    __SET_BIAS(float,s_pparam_test,bias) = (float)atof(s);
}
#endif
{% endhighlight %}

`set_##X##_param` ，如果XX为 int ,则会被替换为，`set_int_param` 

为什么我说这是个少儿不宜的事情，其实即便你已经成年，也不该如此书写代码。道理很简单。如果是 `set_string_param` 的函数，内部不能 `__SET_BIAS(X,s_pparam_test,bias) = XX(s);` 简单替换怎么办？ 

>鬼话：别嫉妒那些更高级的语言，有什么重载，多态的名词，其实无非如上述一样的设计。任何语言，如果在一个函数里，存在一条语句，可以针对不同类型进行类似的操作，如同 A = B+C，而不在乎A，B，C的类型。他实际编译后，和你上述写的各种类型的函数实现，并使用对应函数指针进行链接没有区别。无非，C语言，需要比较土的写出来。 

我们需要实现上述设计，脱离不了 struct 这个万能的打包器。为什么？我们看下如下定义

{% highlight c %}
typedef struct{
    int zero : 1;
    unsigned int overflow : 1;
    unsigned int data : 5;
    unsigned int extend : 1;
} FLAG_S;
FLAG_S ff;
ff.zero = 3;
ff.overflow = 1;
ff.data = 27;
ff.extend = 3;
{% endhighlight %}

你尝试将这些值打印出来看看

{% highlight c %}
printf("%x : %d : %d : %d : %d\n",*(char*)&ff,ff.zero,ff.overflow,ff.data,ff.extend);
{% endhighlight %}

这里表示 ，ff所对应的存储空间，第0为，给zero使用，所以即便你赋值为3，仍然设置个1，由于是int型，带符号，所以输出为-1，而 `ff.extend` 虽然也只有一位，也是只能设置1，虽然赋值为3，但打印确实1, 16进制打印出的 ffffffef,实际真正有效的ef对应二进制为 1 1 1 0 1 1 1 1 .实际与上述ff内的单元对应如下 
    1 | 1 1 0 1 1| 1 | 1 
    extend | data | overflow | zero 
同时你应该好好读读，参考文献1 的6.7.8.6的例子的解释。其实参考文献 1 中设计struct的内容，都应该好好读读。 

如果你仍然坚持使用书本的C语言设计方法，不妨我们继续增加逻辑。对各种参数我们增加范围限制，如果当超出范围，自动将参数设置成默认值。看看那种方法能更快，更有效，更保证正确性的设计出来。

>鬼话：模块化编程在局部细节上的一个思想就是尽可能的抽象出雷同逻辑。使用数组，结构体，特别是函数指针，宏定义，等方式来实现。抽象抽象再抽象，即是学好数学的学问，也是编好程序的学问。努力的把直白的“简单”问题，搞抽象的”复杂“起来，将非常有助于在复杂的直白问题时，”简单“的用抽象的方法实现。

     
我们再看一下 
    #define __BIAS_STRUCT(type,member) (unsigned long)&(((type *)0)->member) 
这样的工作，在C的标准库其实是存在。你可以在参考文献1中涉及 stddef.h 对应的 章节，找到  offsetof的宏用法。同时，当你在参考文献1中，检索struct时，你会发现另一个存储结构的约束名词，union。 

>鬼话：千万记得，别用字典查找union的中文意思，来理解。一些说法，“共用”是正确的。我的态度，对同一空间的混用。混，这里不是个褒义词。 union，权且继续说“混用”吧。 

{% highlight c %}
union U{ 
    char c; 
    int i; 
    double d; 
} ; 
union U u1; 
int ti; 
u1.c=2; 
ti = u1.i; 
u1.d = 4.0;
{% endhighlight %}

你实际给出了union 的一个结构体类型的声明，对应存储空间申请，存储空间内存储单元，读，写的例子。了解和学习union，其实你只要搞清楚两点。 

1. 这里，u1.c  u1.i u1.d都是用同一个空间。这里强调“用同一个”，当然“用”表示实在的可以使用，则你可以推断，实际结构体至少有double这个类型的宽度。 
2. u1.c ,u1.i u1.d 混用同一个空间。这里强调一个混字。任意时刻，存储空间里的值可以不变，但通过你的不同书写方式，这些值可以被理解成不同的类型进行使用。这是好的方面，但也有坏的方面，就是对空间存储内容时，如下 
    u1.c = 2; 
    u1.i = 3; 
    u1.d = 5.3; 
则实际存储空间里，存放的值，被看作double类型时，为5.3。前面2也好，3也罢，都被覆盖掉了。 

我不想强调复用。是因为，union是一个非常容易搞混逻辑，且容易出错的语法设计。除非你能保证，对一个存储空间的描述逻辑在整个存储数据的生命周期里不变。 

>鬼话：别和我强调，灵活使用union，对存储空间里的值，进行不同方式的描述使用，提升了代码的灵活性。与其这样，不如对空间存储数值的强制转换。后者能更清晰的描述逻辑，提高代码可读性。 

union讲完了，详细的信息你可以参考文献1。 

>鬼话：易出错，不易理解，的东西，我尽量少讲。虽然现在很多代码中，仍然有union的出现。但我仍然不建议你灵活的使用它。唯一的理由就是经验之谈，你越灵活的使用union，你的代码的可读性就越差。记得代码更多时候，是给以后的你，来阅读的。 

至此，C语言的关键字，已经基本讲完，余下有四个设计存储空间描述的关键字，restrict ,auto ,register ,volatile,和一堆 _打头的内容。你可以在参考文献 1 6.4.1中看到清单，同时你可以根据参考文献 1 最后的  index 找到各个关键字的描述章节，并依次查看对应内容。 

>鬼话：如果我认为本书中有几个最有帮助的内容，那么上面这段文字，是其一。我更希望告诉新手方法，而不是那些具体的设计方式或所谓的技巧。这么多年C程序写下来，一个心得，最简单的，往往是最有效，也是最好的方式。沉迷于奇淫巧技的人，不如听我一句劝，为人民服务，才是价值体现的好方式。 

补充讨论讨论 restrict ,auto ,register ,volatile 。这里几个都和编译器的编译方式有关系。如果只是debug 版本，或者不带任何优化，上述几个几乎没有存在的必要。这些关键词，是对存储结构的约束。也算是对“任意”存储结构的设计一个补充。不过下面的篇幅这么小，是处于两个原因， 

1. 正常的代码，不考虑优化，不考虑异步（包含进程之间，CPU与外设等）你很难碰到。 
2. 这些东西，如果你需要碰到，恭喜你，只有你自己通过出错的理解，才能深刻领会他们的用法。而基本的信息，下面的足够，不行你可以看看参考文献 1的相关内容。 

auto，这个你几乎可以无视。含义是只有在执行到这里时，才会申请空间。哇塞，你是不是动心于 malloc 终于可以退休了。别高兴，这里的 auto 空间申请的代码仍然存在于指令中，实际上你函数中，没有其他约束的诸如 register ,static 的存储空间，都是 auto ，如何实现使用时获取空间，当前作用域结束后，该空间无意义？很简单，用堆栈或者临时使用某个寄存器就可以。 

你也可以认为，auto 就是函数内申请空间的默认约束，针对编译器。 

register，的含义是，请你尽可能的使用寄存器来分配这个空间。一些编译器，甚至可以指定具体的寄存器。有什么好处？块啊。读取，和写入的操作，直接针对寄存器，不许要ldr 等等操作。但不代表 register 所约束的存储空间都可以使用寄存器来存放。毕竟寄存器是有限的。 

volatile 这个和优化编译有关。强调的是这个存储空间的值经常被改变，甚至被其他进程改变。由此，每次使用它，你必须从外面读取进来。这在算法优化中，会展开讨论。 

restrict 针对的指针所指向的存储空间。约束这个空间，只能通过这个指针来指引使用。毕竟我们不同的指针可以指向同一个存储空间。如果存储空间 A，被p1,p2分别指引。而对p1存在restrict的约束，那么你的代码，就不能通过p2来尝试改变A空间的值。有什么用？编译器会对此类问题做对应防范性处理。 

>鬼话：restrict，仍然不建议用。首先它是C99的东西。其次，没它，一样做出好程序，有它，也不能帮你做出好程序。register，有它，则有可能帮你做出好程序，没它一样能做出好程序。volatile，没它，很有可能出故事，故事还会引发事故。有它，很多故事都可以避免，自然也不会出事故。


上一篇：[数组，指针，字符串（下）](/candcpp/ghost-c-lang-6-3.html)

下一篇：[完善MVC的DEMO，闲话MAKEFILE](/candcpp/ghost-c-lang-8.html)