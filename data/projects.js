window.PROJECTS = [
    { id:'substance', carousel:true,
      name:'某种物质', name_en:'The Substance',
      date:'2025.11',
      role:'单人项目 · 关卡策划 · 系统策划 · 程序', role_en:'Solo Project · Level Design · Gameplay Design · Programming',
      spec:'3D · 第三人称解谜 · UE5', spec_en:'3D · Third-Person Puzzle · Unreal Engine 5',
      shots:[{src:'images/substance/01.jpg', note:'实机截图'},
             {src:'images/substance/02.jpg', note:'布局设计：一楼'}],
      videos:[{ label:'实机演示', src:'bilibili:BV1JFHX6zEoW' }],
      md:`## 项目概述

本原型基于 Unreal Engine 5.6 开发，采用第三人称视角，是一款==以解谜为核心的线性关卡==。

背景设定在一座破损的、建于前末日时代的==科技博物馆==中，馆内收藏有一种被称为「某种物质」的特殊材料——它可在力的作用下==融合放大==，并能借助共振设备==分裂缩小==。玩家身处一个因「科技滥用」而毁灭的后末日世界，进入这座博物馆，目标是取得位于楼顶的镇馆之宝「共振球」。

在装备上原本作为展品展出的小型共振器后，玩家获得「吸取投掷」能力，可操控「某种物质」进行融合与分裂，从而实现物体的放大与缩小。玩家需在博物馆空间内完成一系列解谜与轻度机制性战斗，最终成功取得「共振球」。`,
      md_en:`## Overview

This prototype is developed in Unreal Engine 5.6 and uses a third-person perspective. It is a ==linear, puzzle-centric level==.

Set in a ==dilapidated science and technology museum== built in the pre-apocalyptic era, the museum houses a special material known as “The Substance”—when subjected to force, it can ==fuse to enlarge==, and with the aid of resonance devices, it can ==split to shrink==. The player is in a post-apocalyptic world destroyed by the “misuse of technology.” They enter the museum with the goal of obtaining the museum’s prized treasure, the “Resonance Sphere,” located on the rooftop.

After equipping a small resonator originally on display as an exhibit, the player gains the “Attract and Throw” ability, allowing them to manipulate “The Substance” to fuse and split, thereby enlarging and shrinking objects. The player must complete a series of puzzles and a light, mechanics-driven combat encounter within the museum, and ultimately succeed in obtaining the “Resonance Sphere.”` },

    { id:'symbiont', carousel:true,
      name:'赛博蛹生', name_en:'Symbiont',
      date:'2025.05 – 2025.09',
      role:'团队项目 · 主策划 · 系统策划 · 任务策划 · 关卡策划 · 程序 · 项目管理', role_en:'',
      spec:'3D · 第三人称射击潜行 · UE5', spec_en:'',
      shots:[{src:'images/symbiont/01.jpg', note:'实机截图'},
             {src:'images/symbiont/02.jpg', note:'实机截图'},
             {src:'images/symbiont/05.jpg', note:'演示截图'}],
      videos:[{ label:'预告短片', src:'bilibili:BV1PTHS6ME6g' },
              { label:'实机演示',   src:'bilibili:BV1AgHS6KEiH' }],
      md:`## 项目概述

玩家化身为一名==赛博佣兵==，执行致命双重任务：潜入企业堡垒窃取尖端科技，终结目标CEO。然而你盗取的芯片中，竟蛰伏着复仇AI——它侵入你的神经，赋予骇客能力，缔结危险同盟。你能否突破企业天罗地网，查明与这电子魅影共猎同一目标的真相，最终揭开惊天阴谋？

## 核心职责

- **项目管理**：制定开发计划、拆解任务节点、管理文档版本与迭代节奏
- **核心玩法机制（3C）**：设计并实现角色、相机与操控逻辑
- **角色与交互系统**：设计角色状态、交互触发条件与反馈响应逻辑
- **UI/UX 与音频系统**：设计界面布局、信息层级与交互反馈，并通过蓝图集成音效`,
      md_en:'' },

    { id:'shelter', carousel:true,
      name:'避难所', name_en:'Shelter',
      date:'2024.09 – 2024.11',
      role:'团队项目 · 策划 · 美术', role_en:'',
      spec:'桌游 · 多人合作策略', spec_en:'',
      shots:[{src:'images/shelter/01.jpg', note:'试玩现场'},
             {src:'images/shelter/02.jpg', note:'手册封面'}],
      videos:[],
      md:`## 项目概述

《避难所》让玩家身临其境地体验一场突如其来的==核泄漏==。1至4名玩家可参与游戏，每位玩家控制一名默认幸存者或一名特殊家庭成员角色，将他们安全安置在家庭避难所中，让他们外出寻找必要的消耗品和通讯工具，以便与外界重新取得联系，更重要的是，他们要努力合作生存下去。

## 核心职责

- **核心玩法机制**：设计回合流程、资源循环、行动选项与胜负条件
- **桌游组件设计**：设计版图、卡牌、标记等实体组件，明确功能、数量、视觉识别与交互关系
- **规则手册设计**：撰写并排版规则层级、示例图示与速查内容`,
      md_en:'' },

    { id:'counter-ghost', carousel:false,
      name:'灵单猎人', name_en:'Counter Ghost',
      date:'2025.03 – 2025.05',
      role:'团队项目 · 系统策划 · 程序', role_en:'',
      spec:'VR · 第一人称侦探恐怖 · UE5', spec_en:'',
      shots:[{src:'images/counter-ghost/01.jpg', note:'实机截图'},
             {src:'images/counter-ghost/02.jpg', note:'关卡场景'}],
      videos:[],
      md:`## 项目概述

玩家化身为一名超自然事件处理公司的==职业驱魔师==，你的日常工作就是：调查凶宅、收集灵异证据、解析恶灵属性，最后用最对症的方案执行驱魔——记住，这不过是又一次的例行公事罢了？

## 核心职责

- **核心玩法机制（3C）**：设计并实现角色、相机与操控逻辑
- **角色与交互系统**：设计角色状态、交互触发条件与反馈响应逻辑
- **教程关卡设计**：规划教学引导流程、提示节奏与核心操作引入方式
- **UI/UX 与音频系统**：设计界面布局、信息层级与交互反馈，并通过蓝图集成音效`,
      md_en:'' },

    { id:'powerup', carousel:false,
      name:'喵力全开', name_en:'Power Up',
      date:'2024.11 – 2025.03',
      role:'团队项目 · 关卡策划 · 系统策划 · 程序', role_en:'',
      spec:'2D · 俯视角解谜潜行 · Unity', spec_en:'',
      shots:[{src:'images/powerup/01.jpg', note:'开始界面'},
             {src:'images/powerup/02.jpg', note:'关卡场景'}],
      videos:[],
      md:`## 项目概述

玩家化身为一只==侦探猫==，于深夜潜入一座废弃工厂，试图深入其核心探寻真相。工厂内漆黑一片，侦探猫为探路拉下电闸，不料竟惊醒了工厂内沉睡已久的机器守卫……面对被唤醒的机械威胁，侦探猫能否巧妙周旋，甚至化险为夷，一路潜入工厂最深处，揭开最终的秘密？


## 核心职责

- **核心玩法机制（3C）**：设计并实现角色、相机与操控逻辑
- **关卡架构与设计**：规划地图布局、流程与节奏
- **可交互物件系统**：设计可交互物件的功能与反馈`,
      md_en:'' },
  ];