import { defineGkdApp } from '@gkd-kit/define';

export default defineGkdApp({
  id: 'com.tencent.mm',
  name: '微信',
  groups: [
    {
      key: 0,
      name: '西安交警-违停上报',
      // 方案 A：GKD 只做确定性的点击类操作；文本输入（问题描述/详细地址/定位搜索词）与号牌、最终提交均由用户手动。
      // 定位选点（重新选择→搜索→选第一条→完成）因搜索词为文本输入、结果 text 动态且与相机「完成」同名，一并交由用户。
      desc: '手动进入「西安交警」小程序后，自动完成「交通违法随手拍 → 违停行为上报」中可确定化的点击操作；文本输入、定位选点、号牌与最终提交由用户手动。',
      rules: [
        // 说明：微信小程序为 webview，页面切换不一定触发无障碍事件，故给后续规则加
        // matchTime/forcedTime 主动轮询窗口，并加 matchDelay/actionDelay 提升点击稳定性。
        // 每条规则以 actionMaximum:1 + resetMatch:'match' 保证只在目标界面出现时重置并执行一次，
        // 规避跳页后旧 webview 节点残留导致的重复触发；微信小程序同 Activity 内跳页不触发无障碍事件，
        // 故不能用 resetMatch:'app'（仅在重进 app 时重置），否则第一步执行后规则休眠、后续步骤永不评估。
        // 1. 首页 -> 随手拍
        {
          key: 101,
          name: '首页-点击随手拍',
          order: 101,
          actionMaximum: 1,
          resetMatch: 'match',
          matchRoot: true,
          matches: '[text="随手拍"][visibleToUser=true]',
          action: 'click',
        },
        // 2. 随手拍页 -> 点击「交通违法行为」卡片
        //    [修改] 该卡片文字「交通违法行为/立即上报」是无障碍树中的图片渲染，不含 text 节点。
        //    故以唯一可见的「王平」用户卡片为锚，取其紧邻的后置兄弟可点击 Button（即交通违法卡片），实现结构锚定。
        //    [修改] 用 clickCenter 而非 click：小程序 webview 对合成可点击节点不响应无障碍 ACTION_CLICK，
        //    但响应坐标模拟触摸；配合 Shizuku 可强制模拟点击，绕过小程序的无障碍防御。
        {
          key: 102,
          name: '随手拍页-点击立即上报',
          order: 102,
          actionMaximum: 1,
          resetMatch: 'match',
          matchRoot: true,
          matchDelay: 300,
          matchTime: 6000,
          forcedTime: 4000,
          actionDelay: 200,
          matches:
            'Button[text="王平 17795905083"][clickable=true] + @Button[clickable=true][visibleToUser=true]',
          action: 'clickCenter',
        },
        // 3. 用户须知 -> 勾选「我已阅读并同意」
        {
          key: 103,
          name: '用户须知-勾选我已阅读并同意',
          order: 103,
          actionMaximum: 1,
          resetMatch: 'match',
          matchRoot: true,
          matchDelay: 300,
          matchTime: 6000,
          forcedTime: 4000,
          actionDelay: 200,
          matches: '[text="我已阅读并同意"][visibleToUser=true]',
          action: 'click',
        },
        // 4. 用户须知 -> 点击「开始上报」（需先勾选）
        {
          key: 104,
          name: '用户须知-点击开始上报',
          order: 104,
          preKeys: [103],
          actionMaximum: 1,
          resetMatch: 'match',
          matchRoot: true,
          matchDelay: 300,
          matchTime: 6000,
          forcedTime: 4000,
          actionDelay: 200,
          matches: '[text="开始上报"][visibleToUser=true]',
          action: 'click',
        },
        // 5. 违法类型 -> 选择「违停行为」
        {
          key: 105,
          name: '违法类型-选择违停行为',
          order: 105,
          actionMaximum: 1,
          resetMatch: 'match',
          matchRoot: true,
          matchDelay: 300,
          matchTime: 6000,
          forcedTime: 4000,
          actionDelay: 200,
          matches: '[text="违停行为"][visibleToUser=true]',
          action: 'click',
        },
        // 6. 填写信息 -> 关闭「注意事项」弹窗（确认）
        {
          key: 106,
          name: '填写信息-关闭弹窗(确认)',
          order: 106,
          actionMaximum: 1,
          resetMatch: 'match',
          matchRoot: true,
          matchDelay: 300,
          matchTime: 6000,
          forcedTime: 4000,
          actionDelay: 200,
          matches: '[text="确认"][visibleToUser=true]',
          action: 'click',
        },
        // 7. 定位选点（重新选择→搜索→选第一条→完成）已按方案 A 交由用户手动，此处不再自动，
        //    原因：搜索词为文本输入、结果 text 动态，且定位「完成」与相机「完成」同名易误触。
        // 8. 拍照 -> 自动点击「上传照片」（第 2/3 张；第 1 张由用户手动点）
        //     preKeys:[111] 表示须先完成一次相机「完成」才自动拉起第 2/3 张，避免抢在用户前触发
        {
          key: 110,
          name: '拍照-点击上传照片(第2/3张)',
          order: 110,
          preKeys: [111],
          actionMaximum: 2,
          resetMatch: 'match',
          matchRoot: true,
          matchDelay: 300,
          matchTime: 6000,
          forcedTime: 4000,
          actionDelay: 200,
          matches: '[text="上传照片"][visibleToUser=true]',
          action: 'click',
        },
        // 9. 相机预览 -> 点击「完成」
        //     相机「完成」与文案可能同名，需在真机确认仅在相机预览界面触发；必要时用结构/activityIds 收敛。
        {
          key: 111,
          name: '相机预览-点击完成',
          order: 111,
          actionMaximum: 3,
          resetMatch: 'match',
          matchRoot: true,
          matchDelay: 300,
          matchTime: 6000,
          forcedTime: 4000,
          actionDelay: 200,
          matches: '[text="完成"][visibleToUser=true]',
          action: 'click',
        },
      ],
    },
  ],
});
