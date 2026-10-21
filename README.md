# Tiny:bit（修复版 v2.0.4）

Yahboom（亚博智能）Tiny:bit 小车的 MakeCode 扩展，**中文积木**，可直接在
makecode.microbit.org 里作为扩展加载。

原版：https://github.com/YahboomTechnology/Tiny-bitLib （MIT License, © Shenzhen Yahboom Tech）

## 为什么要修

原版依赖亚博 2018 年 fork 的 `pxt-neopixel` 0.7.0，该包内含 `sendBuffer.asm`，
与 MakeCode 当前内核里的同名实现冲突，编译时报：

```
-> Line 1 ('sendBufferAsm:'), error: label redefinition
```

## 怎么修的

- 车身彩灯（P12 上的 2 颗 WS2812B）改用 micro:bit 内核自带的 `light.sendWS2812Buffer` 驱动
- `pxt.json` 里去掉 `neopixel` 依赖，本扩展**不再包含任何汇编文件**，因此不可能再出现标签冲突
- 积木 ID、中文文字、其余功能（电机 / 巡线 / 超声波 / 声音 / 音乐）全部保持原样

## 差异

唯一变化：原「车身七彩流水灯」是返回彩灯对象的积木（需要配合 neopixel 积木使用），
现在改为直接生效的语句积木——放一次变一次颜色，可配合循环做出流水效果。

## 使用

MakeCode → 扩展 → 搜索框填本仓库地址。
