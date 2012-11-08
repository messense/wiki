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
>>是重定向。简单说对程序stdout的内容，写入到attr.debug文件中，也就是将屏幕打印的内容写到文件中。和>的区别，你可以看作后者是删除掉目标文件内容重新写入，前者是在目标文件尾端进行追加。尝试上述命令两次，你即可理解。更详细的资料你需要参考linux 下 shell应用的相关资料。此不属于C部分，就不做介绍。 

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