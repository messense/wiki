---
layout: page
title: Sublime Text 2
---

# Sublime Text 2

## 安装

* [Stable Version](http://www.sublimetext.com/2) - 稳定版本下载
* [Dev Build](http://www.sublimetext.com/dev) - 开发版下载，更新更频繁

## Package Control

1. 按 Ctrl+` 调出 console
2. 粘贴以下代码到底部命令行并回车：
  >import urllib2,os;pf='Package Control.sublime-package';ipp=sublime.installed_packages_path();os.makedirs(ipp) if not os.path.exists(ipp) else None;open(os.path.join(ipp,pf),'wb').write(urllib2.urlopen('http://sublime.wbond.net/'+pf.replace(' ','%20')).read())
3. 重启Sublime Text 2
4. 如果在Perferences->package settings中看到package control这一项，则安装成功
5. 如果这种方法不能安装成功，可以[到这里下载文件手动安装](http://wbond.net/sublime_packages/package_control/installation)

## Plugins

* ApacheConf.tmLanguage - Apache 配置文件代码高亮
* INI - .ini 格式文件代码高亮
* SidebarEnhancements - 侧边栏增强
* YUI Compressor - 雅虎 YUI Compressor，主要用于压缩 js 和 css
* SmartMarkdown - Markdown 插件
* Zen Coding - HTML、CSS 自动补全
* Sublime Prefixr - CSS3 私有前缀自动补全插件
* DetectSyntax - 代码格式检测
* Git - Sublime 得 git 插件，基本上实现了git的所有功能

## Theme

* [Soda](https://github.com/buymeasoda/soda-theme) - Dark and light custom UI themes for Sublime Text 2.