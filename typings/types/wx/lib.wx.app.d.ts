/*! *****************************************************************************
Copyright (c) 2021 Tencent, Inc. All rights reserved.

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
of the Software, and to permit persons to whom the Software is furnished to do
so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
***************************************************************************** */

declare namespace WechatMiniprogram.App {
    interface ReferrerInfo {
        /** 鏉ユ簮灏忕▼搴忔垨鍏紬鍙锋垨App鐨?appId
         *
         * 浠ヤ笅鍦烘櫙鏀寔杩斿洖 referrerInfo.appId锛?         * - 1020锛堝叕浼楀彿 profile 椤电浉鍏冲皬绋嬪簭鍒楄〃锛夛細 appId
         * - 1035锛堝叕浼楀彿鑷畾涔夎彍鍗曪級锛氭潵婧愬叕浼楀彿 appId
         * - 1036锛圓pp 鍒嗕韩娑堟伅鍗＄墖锛夛細鏉ユ簮搴旂敤 appId
         * - 1037锛堝皬绋嬪簭鎵撳紑灏忕▼搴忥級锛氭潵婧愬皬绋嬪簭 appId
         * - 1038锛堜粠鍙︿竴涓皬绋嬪簭杩斿洖锛夛細鏉ユ簮灏忕▼搴?appId
         * - 1043锛堝叕浼楀彿妯℃澘娑堟伅锛夛細鏉ユ簮鍏紬鍙?appId
         */
        appId: string
        /** 鏉ユ簮灏忕▼搴忎紶杩囨潵鐨勬暟鎹紝scene=1037鎴?038鏃舵敮鎸?*/
        extraData?: any
    }

    type SceneValues =
        | 1001
        | 1005
        | 1006
        | 1007
        | 1008
        | 1011
        | 1012
        | 1013
        | 1014
        | 1017
        | 1019
        | 1020
        | 1023
        | 1024
        | 1025
        | 1026
        | 1027
        | 1028
        | 1029
        | 1030
        | 1031
        | 1032
        | 1034
        | 1035
        | 1036
        | 1037
        | 1038
        | 1039
        | 1042
        | 1043
        | 1044
        | 1045
        | 1046
        | 1047
        | 1048
        | 1049
        | 1052
        | 1053
        | 1056
        | 1057
        | 1058
        | 1059
        | 1064
        | 1067
        | 1069
        | 1071
        | 1072
        | 1073
        | 1074
        | 1077
        | 1078
        | 1079
        | 1081
        | 1082
        | 1084
        | 1089
        | 1090
        | 1091
        | 1092
        | 1095
        | 1096
        | 1097
        | 1099
        | 1102
        | 1124
        | 1125
        | 1126
        | 1129

    interface LaunchShowOption {
        /** 鎵撳紑灏忕▼搴忕殑璺緞 */
        path: string
        /** 鎵撳紑灏忕▼搴忕殑query */
        query: IAnyObject
        /** 鎵撳紑灏忕▼搴忕殑鍦烘櫙鍊?         * - 1001锛氬彂鐜版爮灏忕▼搴忎富鍏ュ彛锛屻€屾渶杩戜娇鐢ㄣ€嶅垪琛紙鍩虹搴?.2.4鐗堟湰璧峰寘鍚€屾垜鐨勫皬绋嬪簭銆嶅垪琛級
         * - 1005锛氬井淇￠椤甸《閮ㄦ悳绱㈡鐨勬悳绱㈢粨鏋滈〉
         * - 1006锛氬彂鐜版爮灏忕▼搴忎富鍏ュ彛鎼滅储妗嗙殑鎼滅储缁撴灉椤?         * - 1007锛氬崟浜鸿亰澶╀細璇濅腑鐨勫皬绋嬪簭娑堟伅鍗＄墖
         * - 1008锛氱兢鑱婁細璇濅腑鐨勫皬绋嬪簭娑堟伅鍗＄墖
         * - 1011锛氭壂鎻忎簩缁寸爜
         * - 1012锛氶暱鎸夊浘鐗囪瘑鍒簩缁寸爜
         * - 1013锛氭壂鎻忔墜鏈虹浉鍐屼腑閫夊彇鐨勪簩缁寸爜
         * - 1014锛氬皬绋嬪簭妯℃澘娑堟伅
         * - 1017锛氬墠寰€灏忕▼搴忎綋楠岀増鐨勫叆鍙ｉ〉
         * - 1019锛氬井淇￠挶鍖咃紙寰俊瀹㈡埛绔?.0.0鐗堟湰鏀逛负鏀粯鍏ュ彛锛?         * - 1020锛氬叕浼楀彿 profile 椤电浉鍏冲皬绋嬪簭鍒楄〃
         * - 1023锛氬畨鍗撶郴缁熸闈㈠浘鏍?         * - 1024锛氬皬绋嬪簭 profile 椤?         * - 1025锛氭壂鎻忎竴缁寸爜
         * - 1026锛氬彂鐜版爮灏忕▼搴忎富鍏ュ彛锛屻€岄檮杩戠殑灏忕▼搴忋€嶅垪琛?         * - 1027锛氬井淇￠椤甸《閮ㄦ悳绱㈡鎼滅储缁撴灉椤点€屼娇鐢ㄨ繃鐨勫皬绋嬪簭銆嶅垪琛?         * - 1028锛氭垜鐨勫崱鍖?         * - 1029锛氬皬绋嬪簭涓殑鍗″埜璇︽儏椤?         * - 1030锛氳嚜鍔ㄥ寲娴嬭瘯涓嬫墦寮€灏忕▼搴?         * - 1031锛氶暱鎸夊浘鐗囪瘑鍒竴缁寸爜
         * - 1032锛氭壂鎻忔墜鏈虹浉鍐屼腑閫夊彇鐨勪竴缁寸爜
         * - 1034锛氬井淇℃敮浠樺畬鎴愰〉
         * - 1035锛氬叕浼楀彿鑷畾涔夎彍鍗?         * - 1036锛欰pp 鍒嗕韩娑堟伅鍗＄墖
         * - 1037锛氬皬绋嬪簭鎵撳紑灏忕▼搴?         * - 1038锛氫粠鍙︿竴涓皬绋嬪簭杩斿洖
         * - 1039锛氭憞鐢佃
         * - 1042锛氭坊鍔犲ソ鍙嬫悳绱㈡鐨勬悳绱㈢粨鏋滈〉
         * - 1043锛氬叕浼楀彿妯℃澘娑堟伅
         * - 1044锛氬甫 shareTicket 鐨勫皬绋嬪簭娑堟伅鍗＄墖 [璇︽儏](https://developers.weixin.qq.com/miniprogram/dev/framework/open-ability/share.html)
         * - 1045锛氭湅鍙嬪湀骞垮憡
         * - 1046锛氭湅鍙嬪湀骞垮憡璇︽儏椤?         * - 1047锛氭壂鎻忓皬绋嬪簭鐮?         * - 1048锛氶暱鎸夊浘鐗囪瘑鍒皬绋嬪簭鐮?         * - 1049锛氭壂鎻忔墜鏈虹浉鍐屼腑閫夊彇鐨勫皬绋嬪簭鐮?         * - 1052锛氬崱鍒哥殑閫傜敤闂ㄥ簵鍒楄〃
         * - 1053锛氭悳涓€鎼滅殑缁撴灉椤?         * - 1056锛氳亰澶╅《閮ㄩ煶涔愭挱鏀惧櫒鍙充笂瑙掕彍鍗?         * - 1057锛氶挶鍖呬腑鐨勯摱琛屽崱璇︽儏椤?         * - 1058锛氬叕浼楀彿鏂囩珷
         * - 1059锛氫綋楠岀増灏忕▼搴忕粦瀹氶個璇烽〉
         * - 1064锛氬井淇￠椤佃繛Wi-Fi鐘舵€佹爮
         * - 1067锛氬叕浼楀彿鏂囩珷骞垮憡
         * - 1069锛氱Щ鍔ㄥ簲鐢?         * - 1071锛氶挶鍖呬腑鐨勯摱琛屽崱鍒楄〃椤?         * - 1072锛氫簩缁寸爜鏀舵椤甸潰
         * - 1073锛氬鏈嶆秷鎭垪琛ㄤ笅鍙戠殑灏忕▼搴忔秷鎭崱鐗?         * - 1074锛氬叕浼楀彿浼氳瘽涓嬪彂鐨勫皬绋嬪簭娑堟伅鍗＄墖
         * - 1077锛氭憞鍛ㄨ竟
         * - 1078锛氬井淇¤繛Wi-Fi鎴愬姛鎻愮ず椤?         * - 1079锛氬井淇℃父鎴忎腑蹇?         * - 1081锛氬鏈嶆秷鎭笅鍙戠殑鏂囧瓧閾?         * - 1082锛氬叕浼楀彿浼氳瘽涓嬪彂鐨勬枃瀛楅摼
         * - 1084锛氭湅鍙嬪湀骞垮憡鍘熺敓椤?         * - 1089锛氬井淇¤亰澶╀富鐣岄潰涓嬫媺锛屻€屾渶杩戜娇鐢ㄣ€嶆爮锛堝熀纭€搴?.2.4鐗堟湰璧峰寘鍚€屾垜鐨勫皬绋嬪簭銆嶆爮锛?         * - 1090锛氶暱鎸夊皬绋嬪簭鍙充笂瑙掕彍鍗曞敜鍑烘渶杩戜娇鐢ㄥ巻鍙?         * - 1091锛氬叕浼楀彿鏂囩珷鍟嗗搧鍗＄墖
         * - 1092锛氬煄甯傛湇鍔″叆鍙?         * - 1095锛氬皬绋嬪簭骞垮憡缁勪欢
         * - 1096锛氳亰澶╄褰?         * - 1097锛氬井淇℃敮浠樼绾﹂〉
         * - 1099锛氶〉闈㈠唴宓屾彃浠?         * - 1102锛氬叕浼楀彿 profile 椤垫湇鍔￠瑙?         * - 1124锛氭壂鈥滀竴鐗╀竴鐮佲€濇墦寮€灏忕▼搴?         * - 1125锛氶暱鎸夊浘鐗囪瘑鍒€滀竴鐗╀竴鐮佲€?         * - 1126锛氭壂鎻忔墜鏈虹浉鍐屼腑閫夊彇鐨勨€滀竴鐗╀竴鐮佲€?         * - 1129锛氬井淇＄埇铏闂?[璇︽儏](https://developers.weixin.qq.com/miniprogram/dev/reference/configuration/sitemap.html)
         */
        scene: SceneValues
        /** shareTicket锛岃瑙?[鑾峰彇鏇村杞彂淇℃伅]((杞彂#鑾峰彇鏇村杞彂淇℃伅)) */
        shareTicket: string
        /** 褰撳満鏅负鐢变粠鍙︿竴涓皬绋嬪簭鎴栧叕浼楀彿鎴朅pp鎵撳紑鏃讹紝杩斿洖姝ゅ瓧娈?*/
        referrerInfo?: ReferrerInfo
    }

    interface PageNotFoundOption {
        /** 涓嶅瓨鍦ㄩ〉闈㈢殑璺緞 */
        path: string
        /** 鎵撳紑涓嶅瓨鍦ㄩ〉闈㈢殑 query */
        query: IAnyObject
        /** 鏄惁鏈鍚姩鐨勯涓〉闈紙渚嬪浠庡垎浜瓑鍏ュ彛杩涙潵锛岄涓〉闈㈡槸寮€鍙戣€呴厤缃殑鍒嗕韩椤甸潰锛?*/
        isEntryPage: boolean
    }

    interface Option {
        /** 鐢熷懡鍛ㄦ湡鍥炶皟鈥旂洃鍚皬绋嬪簭鍒濆鍖?         *
         * 灏忕▼搴忓垵濮嬪寲瀹屾垚鏃惰Е鍙戯紝鍏ㄥ眬鍙Е鍙戜竴娆°€?         */
        onLaunch(options: LaunchShowOption): void
        /** 鐢熷懡鍛ㄦ湡鍥炶皟鈥旂洃鍚皬绋嬪簭鏄剧ず
         *
         * 灏忕▼搴忓惎鍔紝鎴栦粠鍚庡彴杩涘叆鍓嶅彴鏄剧ず鏃?         */
        onShow(options: LaunchShowOption): void
        /** 鐢熷懡鍛ㄦ湡鍥炶皟鈥旂洃鍚皬绋嬪簭闅愯棌
         *
         * 灏忕▼搴忎粠鍓嶅彴杩涘叆鍚庡彴鏃?         */
        onHide(): void
        /** 閿欒鐩戝惉鍑芥暟
         *
         * 灏忕▼搴忓彂鐢熻剼鏈敊璇紝鎴栬€?api
         */
        onError(/** 閿欒淇℃伅锛屽寘鍚爢鏍?*/ error: string): void
        /** 椤甸潰涓嶅瓨鍦ㄧ洃鍚嚱鏁?         *
         * 灏忕▼搴忚鎵撳紑鐨勯〉闈笉瀛樺湪鏃惰Е鍙戯紝浼氬甫涓婇〉闈俊鎭洖璋冭鍑芥暟
         *
         * **娉ㄦ剰锛?*
         * 1. 濡傛灉寮€鍙戣€呮病鏈夋坊鍔?`onPageNotFound` 鐩戝惉锛屽綋璺宠浆椤甸潰涓嶅瓨鍦ㄦ椂锛屽皢鎺ㄥ叆寰俊瀹㈡埛绔師鐢熺殑椤甸潰涓嶅瓨鍦ㄦ彁绀洪〉闈€?         * 2. 濡傛灉 `onPageNotFound` 鍥炶皟涓張閲嶅畾鍚戝埌鍙︿竴涓笉瀛樺湪鐨勯〉闈紝灏嗘帹鍏ュ井淇″鎴风鍘熺敓鐨勯〉闈笉瀛樺湪鎻愮ず椤甸潰锛屽苟涓斾笉鍐嶅洖璋?`onPageNotFound`銆?         *
         * 鏈€浣庡熀纭€搴擄細 1.9.90
         */
        onPageNotFound(options: PageNotFoundOption): void
        /**
         * 灏忕▼搴忔湁鏈鐞嗙殑 Promise 鎷掔粷鏃惰Е鍙戙€備篃鍙互浣跨敤 [wx.onUnhandledRejection](https://developers.weixin.qq.com/miniprogram/dev/api/base/app/app-event/wx.onUnhandledRejection.html) 缁戝畾鐩戝惉銆傛敞鎰忎簨椤硅鍙傝€?[wx.onUnhandledRejection](https://developers.weixin.qq.com/miniprogram/dev/api/base/app/app-event/wx.onUnhandledRejection.html)銆?         * **鍙傛暟**锛氫笌 [wx.onUnhandledRejection](https://developers.weixin.qq.com/miniprogram/dev/api/base/app/app-event/wx.onUnhandledRejection.html) 涓€鑷?         */
        onUnhandledRejection: OnUnhandledRejectionCallback
        /**
         * 绯荤粺鍒囨崲涓婚鏃惰Е鍙戙€備篃鍙互浣跨敤 wx.onThemeChange 缁戝畾鐩戝惉銆?         *
         * 鏈€浣庡熀纭€搴擄細 2.11.0
         */
        onThemeChange: OnThemeChangeCallback
    }

    type Instance<T extends IAnyObject> = Option & T
    type Options<T extends IAnyObject> = Partial<Option> &
        T &
        ThisType<Instance<T>>
    type TrivialInstance = Instance<IAnyObject>

    interface Constructor {
        <T extends IAnyObject>(options: Options<T>): void
    }

    interface GetAppOption {
        /** 鍦?`App` 鏈畾涔夋椂杩斿洖榛樿瀹炵幇銆傚綋App琚皟鐢ㄦ椂锛岄粯璁ゅ疄鐜颁腑瀹氫箟鐨勫睘鎬т細琚鐩栧悎骞跺埌App涓€備竴鑸敤浜庣嫭绔嬪垎鍖?         *
         * 鏈€浣庡熀纭€搴擄細 2.2.4
         */
        allowDefault?: boolean
    }

    interface GetApp {
        <T extends IAnyObject = IAnyObject>(opts?: GetAppOption): Instance<T>
    }
}

declare let App: WechatMiniprogram.App.Constructor
declare let getApp: WechatMiniprogram.App.GetApp

