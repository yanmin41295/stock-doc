import { sidebar } from "vuepress-theme-hope";

export default sidebar({
  "/": [
    "",
    "portfolio",
    {
      text: "双栏布局",
      icon: "columns",
      link: "two-column-layout.html",
    },
    {
      text: "股票学习总结与复盘",
      icon: "chart-line",
      prefix: "stock/",
      link: "stock/",
      children: [
        "",
        "集合竞价",
        "notes",
        "reviews",
        "strategies",
        "risk-management",
        "insights",
        "龙头战法",
      ],
    },
    {
      text: "案例",
      icon: "laptop-code",
      prefix: "demo/",
      link: "demo/",
      children: "structure",
    },
    {
      text: "文档",
      icon: "book",
      prefix: "guide/",
      children: "structure",
    },
    {
      text: "幻灯片",
      icon: "person-chalkboard",
      link: "https://ecosystem.vuejs.press/zh/plugins/markdown/revealjs/demo.html",
    },
  ],
});