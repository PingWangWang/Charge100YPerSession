import { defineGkdApp } from '@gkd-kit/define';

export default defineGkdApp({
  id: 'com.tencent.mm',
  name: '微信',
  groups: [
    {
      key: 0,
      name: '西安交警-违停上报',
      // 方案 A：GKD 只做确定性的点击类操作（止于「填写违法信息」页之前的点击）；「填写违法信息」页的弹窗确认、文本输入（问题描述/详细地址/定位搜索词）、定位选点、拍照、号牌与最终提交全部由用户手动，避免「确认」等通用按钮误触发。
      // 定位选点（重新选择→搜索→选第一条→完成）因搜索词为文本输入、结果 text 动态且与相机「完成」同名，一并交由用户。
      desc: '手动进入「西安交警」小程序后，自动完成「交通违法随手拍 → 选择违停行为」的点击操作（止于「填写违法信息」页之前）；「填写违法信息」页及之后的弹窗确认、文本输入、定位选点、拍照、号牌与最终提交全部由用户手动，避免「确认」等通用按钮误触发。',
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
        //    [修复] 原配置会在「开始上报」仍置灰时提前点击，导致第四步卡死：
        //    preKeys:[103] 只约束顺序、不保证 103 的点击效果已生效；原 matches 只看 visibleToUser
        //    不看是否启用，置灰按钮仍满足匹配；actionDelay:200 去抖盖不住 webview 重渲染延迟；
        //    且 actionMaximum:1 让一次落空点击永久消耗配额。故采用"延迟+重试"（A+C）方案：
        //    1) actionDelay 200→800，等待 webview 勾选后解锁按钮的渲染耗时（主修复，直接覆盖时序）；
        //    2) actionMaximum 1→5，即便前几次点击落在置灰态也留足重试余量（forcedTime:12000 窗口内可多次尝试）。
        //    [注意] GKD 选择器不支持 enabled 属性（已用 check 验证报 Unknown Identifier），
        //    且 webview 禁用按钮多仍上报 clickable=true，故无法用选择器直接判定"按钮已启用"。
        //    若实测仍偶发卡在用户须知，请提供该页 GKD 无障碍快照，确认禁用态是否有可靠标记再做结构锚定。
        {
          key: 104,
          name: '用户须知-点击开始上报',
          order: 104,
          preKeys: [103],
          actionMaximum: 5,
          resetMatch: 'match',
          matchRoot: true,
          activityIds: ['com.tencent.mm.plugin.appbrand.ui.AppBrandUI00'],
          matchDelay: 300,
          matchTime: 15000,
          forcedTime: 12000,
          actionDelay: 800,
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
        // 自动链路到此为止——止于「填写违法信息」页之前（上一条 rule 105 选择「违停行为」为最后一步自动点击）。
        // 原 rule 106（填写信息-关闭弹窗「确认」）已移除：
        //   「确认」文本过于通用，在「填写违法信息」页及后续流程中经常误触发其它确认弹窗，
        //   故「注意事项」弹窗及其后的弹窗确认、文本输入、定位选点、拍照、号牌与最终提交全部交回用户手动。
        // 7. 定位选点（重新选择→搜索→选第一条→完成）已按方案 A 交由用户手动，此处不再自动，
        //    原因：搜索词为文本输入、结果 text 动态，且定位「完成」与相机「完成」同名易误触。
        // 8. 拍照引导（点击二次确认弹窗的「拍照」按钮）已整体移除，改由用户手动点击。
        //    原因：该规则历经多次修复（resetMatch 死循环根因 → 加载中遮罩过渡窗口误触）仍偶发异常，
        //    且小程序 WebView 的弹层节点残留与遮罩焦点误判在 GKD 框架下无法确定性根除，
        //    自动点击的收益不足以覆盖其调试成本，故改为纯手动：用户自行点「上传照片」→「拍照」→相机内拍照→「完成」即可。
      ],
    },
  ],
});
