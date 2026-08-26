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
        // [修改] 网络不佳或手机卡顿会使目标节点延迟出现（如冷启动时「随手拍」较晚渲染），
        // 统一加大 matchTime/forcedTime 窗口，覆盖至约 15 秒内的加载延迟；命中后 actionMaximum:1 仍保证只执行一次。
        // [修改] 整套规则统一限定 activityIds 为西安交警小程序容器 com.tencent.mm.plugin.appbrand.ui.AppBrandUI00，
        // 避免在公众号等其它微信界面误触发（rule 102 结构锚定在公众号 Flutter 界面曾误点右上角头像按钮）。
        // 1. 首页 -> 随手拍
        {
          key: 101,
          name: '首页-点击随手拍',
          order: 101,
          actionMaximum: 1,
          resetMatch: 'match',
          matchRoot: true,
          activityIds: ['com.tencent.mm.plugin.appbrand.ui.AppBrandUI00'],
          matchDelay: 300,
          matchTime: 15000,
          forcedTime: 12000,
          actionDelay: 200,
          matches: '[text="随手拍"][visibleToUser=true]',
          action: 'click',
        },
        // 2. 随手拍页 -> 点击「交通违法行为」卡片
        //    [修改] 该卡片文字「交通违法行为/立即上报」是无障碍树中的图片渲染，不含 text 节点。
        //    故以唯一可见的带文本用户卡片为锚，取其紧邻的后置兄弟可点击 Button（即交通违法卡片），实现结构锚定。
        //    [修改] 锚点不再绑定「王平 17795905083」等真实姓名，改为「有文本的用户卡片」这一通用条件：
        //    `Button[text!=""]` 只命中随手拍主页里唯一带文本且可点击的 Button，与账号姓名解耦，换账号仍有效；
        //    且「用户卡片与其后置兄弟」的结构关系只依赖布局，不依赖具体姓名与绝对像素，故未来换机型仍能命中。
        //    [修改] 用 clickCenter 而非 click：小程序 webview 对合成可点击节点不响应无障碍 ACTION_CLICK，
        //    但响应坐标模拟触摸；配合 Shizuku 可强制模拟点击，绕过小程序的无障碍防御。
        {
          key: 102,
          name: '随手拍页-点击立即上报',
          order: 102,
          actionMaximum: 1,
          resetMatch: 'match',
          matchRoot: true,
          activityIds: ['com.tencent.mm.plugin.appbrand.ui.AppBrandUI00'],
          matchDelay: 300,
          matchTime: 15000,
          forcedTime: 12000,
          actionDelay: 200,
          matches:
            'Button[text!=""][clickable=true][visibleToUser=true] + @Button[clickable=true][visibleToUser=true]',
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
          activityIds: ['com.tencent.mm.plugin.appbrand.ui.AppBrandUI00'],
          matchDelay: 300,
          matchTime: 15000,
          forcedTime: 12000,
          actionDelay: 200,
          matches: '[text="我已阅读并同意"][visibleToUser=true]',
          action: 'click',
        },
        // 4. 用户须知 -> 点击「开始上报」（需先勾选）
        //    [修改] 「开始上报」为 webview 合成的 clickable Button，与交通违法卡片同类，
        //    用 clickCenter（坐标模拟触摸）而非 click，否则勾选后点它不触发跳转。
        {
          key: 104,
          name: '用户须知-点击开始上报',
          order: 104,
          preKeys: [103],
          actionMaximum: 1,
          resetMatch: 'match',
          matchRoot: true,
          activityIds: ['com.tencent.mm.plugin.appbrand.ui.AppBrandUI00'],
          matchDelay: 300,
          matchTime: 15000,
          forcedTime: 12000,
          actionDelay: 200,
          matches: '[text="开始上报"][visibleToUser=true]',
          action: 'clickCenter',
        },
        // 5. 违法类型 -> 选择「违停行为」
        {
          key: 105,
          name: '违法类型-选择违停行为',
          order: 105,
          actionMaximum: 1,
          resetMatch: 'match',
          matchRoot: true,
          activityIds: ['com.tencent.mm.plugin.appbrand.ui.AppBrandUI00'],
          matchDelay: 300,
          matchTime: 15000,
          forcedTime: 12000,
          actionDelay: 200,
          matches: '[text="违停行为"][visibleToUser=true]',
          action: 'click',
        },
        // 6. 填写信息 -> 关闭「注意事项」弹窗（确认）
        //    [修改] 「确认」为 webview 合成的 clickable Button，与「开始上报」「交通违法卡片」同类，
        //    用 click（无障碍 ACTION_CLICK）点它无效，改用 clickCenter（坐标模拟触摸）才能关闭弹窗。
        {
          key: 106,
          name: '填写信息-关闭弹窗(确认)',
          order: 106,
          actionMaximum: 1,
          resetMatch: 'match',
          matchRoot: true,
          activityIds: ['com.tencent.mm.plugin.appbrand.ui.AppBrandUI00'],
          matchDelay: 300,
          matchTime: 15000,
          forcedTime: 12000,
          actionDelay: 200,
          matches: '[text="确认"][visibleToUser=true]',
          action: 'clickCenter',
        },
        // 7. 定位选点（重新选择→搜索→选第一条→完成）已按方案 A 交由用户手动，此处不再自动，
        //    原因：搜索词为文本输入、结果 text 动态，且定位「完成」与相机「完成」同名易误触。
        // 8. 拍照引导 -> 点击「拍照」
        //    [修改] 填写违法信息页有 3 个「上传照片」按钮，用户点击任一个后，小程序会弹出「请拍摄侧前方」二次确认界面，
        //    需点击其中的「拍照」按钮才真正调起相机。此规则自动点击「拍照」，3 个上传照片各自弹出的二次确认界面都要点。
        //    相机内的拍照、预览「完成」、以及后续自动上传照片均交由用户手动，故不再自动点「完成」或第 2/3 张上传照片。
        //    [修改] 二次确认界面为 webview 内的弹层，其「拍照」出现不触发无障碍事件，resetMatch:'match' 无法唤醒
        //    已因 matchTime 休眠的规则。故去掉 matchTime，让规则在填写信息页内保持常驻匹配；用户点「上传照片」派发
        //    事件后由 forcedTime 主动查询捕捉延迟渲染的「拍照」。actionMaximum:5 覆盖 3 张照片及重拍余量。
        {
          key: 112,
          name: '拍照引导-点击拍照',
          order: 112,
          actionMaximum: 5,
          resetMatch: 'match',
          matchRoot: true,
          activityIds: ['com.tencent.mm.plugin.appbrand.ui.AppBrandUI00'],
          matchDelay: 300,
          forcedTime: 12000,
          actionDelay: 200,
          matches: '[text="拍照"][visibleToUser=true]',
          action: 'clickCenter',
        },
      ],
    },
  ],
});
