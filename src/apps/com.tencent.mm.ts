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
        //    填写违法信息页有 3 个「上传照片」按钮，用户点击任一个后，小程序会弹出二次确认界面，
        //    需点击其中的「拍照」按钮才真正调起相机。此规则自动点击「拍照」，3 个上传照片各自弹出的二次确认界面都要点。
        //    注意：二次确认界面的提示语随拍摄方向变化（「请拍摄侧前方」等），不可写死方向；将来若做结构锚定，
        //    只能用「请拍摄」前缀模糊匹配。相机内拍照、预览「完成」、后续自动上传照片均交用户手动。
        //    [根因-快照核实] 始终在场的提示文案「*违法拍照请拍摄3张不同角度的照片」是 TextView 长句，
        //    不会被精确 text="拍照" 命中；仅二次确认弹层含精确 text="拍照" 的节点（对话框内、clickable=true、
        //    与固定提示「2.照片包含道路及周边环境」(id=161) 为相邻兄弟，位于底部照片区）。
        //    第 3 张传完后弹层关闭，webview 残留一个同为该精确「拍照」节点的虚拟节点，旧 bounds 仍压在
        //    第三张照片位置；原 resetMatch:'match' 让该残留节点每次闪烁（消失→出现）都清零 actionMaximum，
        //    规则被反复重新武装、持续 clickCenter 点击第三张照片位置，形成死循环（forcedTime 窗口与余数均帮凶）。
        //    [修复-v22] 去掉 resetMatch:'match'：不去重置，actionMaximum 即成为本次小程序会话内的累计硬上限。
        //    3 次合法点击（对应 3 个上传弹层）恰好耗尽额度，第 3 张传完后任何残留「拍照」节点皆无配额可点，
        //    死循环确定性终止，第三张照片得以定格。matches 保持精确 text="拍照" 不变，合法点击行为零回归。
        //    [新增-加载中遮罩分析] 用户反馈：点相机「完成」后前端弹「加载中」遮罩、后台静默上传，
        //    担心遮罩"事件穿透/焦点误判"误触「拍照」。经 1787798424597 快照核实（对照 1787797343445）：
        //    1) 「加载中」(id=89) 是 WebView DOM 节点（className=null、无原生 Dialog/Mask 容器），并非原生 Android 遮罩层；
        //       它与填写页同处一个 WebView 子树，和「拍照」按钮（id=162，位于另一子树 156→105→…）是【兄弟分支】，
        //       遮罩并非「拍照」按钮的祖先。GKD 选择器无法表达"遮罩覆盖按钮"，且 Android visibleToUser 不反映 Web 遮罩遮挡
        //       → 属"焦点误判"的结构性隐患：只要「拍照」节点仍在树中且 visibleToUser=true，matches 就认为它可点。
        //    2) 但稳态「加载中」快照中，整棵无障碍树里【不存在】精确 text="拍照" 的节点（仅长句提示文案），
        //       即二次确认弹层已随上传开始而关闭、其「拍照」按钮已从树中移除；故稳态遮罩期间 rule 112 根本匹配不到，
        //       不会直接误触。真正风险在【过渡窗口】：相机「完成」后弹层「拍照」按钮可能短暂仍 visibleToUser=true、
        //       同时 WebView 正在渲染「加载中」，GKD 的 matches 只看 text+visibleToUser、无遮挡概念，
        //       若轮询(forcedTime/matchDelay)恰好命中该窗口便会 clickCenter；因「拍照」与遮罩同属 WebView，
        //       系统触摸落到 WebView 后由 Web 命中测试决定（遮罩是否拦截取决于 z-index/pointer-events）→ "偶现"且不确定。
        //    [修复-加载中屏蔽] 为在「加载中」展示期间切实屏蔽对「拍照」的点击响应，采用非侵入防护：
        //    1) actionDelay 200→1000：命中「拍照」后等待并【二次查询】，若对话框已关闭（按钮移除/遮罩已起）
        //       则二次查询落空、不再点击，从而过滤掉过渡窗口里短暂残留的「拍照」节点；
        //    2) matches 增 [clickable=true]：仅命中对话框内可点击的「拍照」按钮，排除任何非按钮的"拍照"文本。
        //    稳态遮罩无「拍照」节点→天然不命中；过渡窗口→被 actionDelay 二次查询过滤；二者结合即实现"加载中 期间屏蔽拍照"。
        //    若日后小程序改为"弹层不关闭、仅用遮罩盖住拍照按钮"，则需改用结构锚定（拍照按钮须为含"请拍摄"提示的弹层子节点），
        //    当前实测无需，先以非侵入方式防护。
        {
          key: 112,
          name: '拍照引导-点击拍照',
          order: 112,
          actionMaximum: 3,
          matchRoot: true,
          activityIds: ['com.tencent.mm.plugin.appbrand.ui.AppBrandUI00'],
          matchDelay: 300,
          forcedTime: 6000,
          actionDelay: 1000,
          matches: '[text="拍照"][clickable=true][visibleToUser=true]',
          action: 'clickCenter',
        },
      ],
    },
  ],
});
