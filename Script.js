/**
 * Clash Verge (Mihomo/Meta) 终极优化脚本
 * 深度复刻小火箭物理隔离逻辑 + 万兆吞吐性能对齐   IPV6 DNS:IPV6  dns-reject-aaaa  "IP-CIDR6,::/0,REJECT,no-resolve",  ipv6关键设置 跟随机场
 */

function main(config) {
  // --- 1. 基础性能优化与GEODATA自动更新 ---
  config["mode"] = "rule";           // 设为规则模式：所有的分流逻辑在此生效
  config["ipv6"] = true;           // ***开启关闭内核的 IPv6 栈支持，允许 Clash 接管并代理系统的 IPv6 流量
  config["allow-lan"] = true;       // 建议补充，确保手机能连
  config["udp"] = true;             // 核心开关：开启内核级 UDP 转发支持
  config["log-level"] = "warning";   // 仅记录警告：减少 I/O 占用，保护你的 SSD 寿命
  config["unified-delay"] = true;    // 统一延迟计算：让不同协议的节点延迟更具可比性
  config["tcp-concurrent"] = true;   // TCP 并发连接：利用 24 核处理器优势，谁快用谁
  config["tcp-fast-open"] = true;    // 开启 TFO：减去 TCP 握手的一个 RTT，网页秒开的关键
  config["find-process-mode"] = "strict"; // 严格进程匹配：确保 Windows 进程分流精准无误
      // Geo相关设置
  config["geo-auto-update"] = true;     // 开启自动更新
  config["geo-update-interval"] = 24;   // 每 24 小时更新一次
  config["geodata-mode"] = true;        // 开启高性能 V2Ray 资源格式支持
  config["geodata-loader"] = "standard";
      // 核心优化：记忆你的节点选择，重启不复位
  config["profile"] = { 
    "store-selected": true,
    "store-fake-ip": true 
  };

    // --- 2. TUN 模式 ---
  config["tun"] = {
    ...(config["tun"] || {}), // 继承 YAML 中的 MTU 和网卡名设置
    "enable": true,      // 强制开启 TUN 模式：接管系统级流量
    "stack": "mixed",    // 使用system gvisor mixed
    "auto-route": true,             // 自动设置路由：无需手动修改系统网关
    "auto-detect-interface": true,  // 自动识别网卡：防止网卡变动导致断网
    "dns-hijack": ["any:53"],       // 劫持所有 53 端口：将所有 DNS 请求拽回 Clash
    "mtu": 1500, // 尝试开启巨型帧支持（需物理链路支持），若断网请改回 1500
    "endpoint-independent-nat": true, // 游戏优化：实现全锥形(Full-cone) NAT 效果，提升联机稳定性
    "udp-timeout": 300,             // UDP 超时设为 300s：防止 游戏或语音断连
    "strict-route": true,            // 严格路由逻辑：防止流量绕过 TUN（物理隔离关键）
  };

     // --- 3. 流量嗅探 ---
  config["sniffer"] = { //sniff是Mihomo 标准方案首选 sniffing向下兼容方案 sniffer客户端封装命名
    "enable": true,                   // 开启嗅探：解决 Fake-IP 模式下域名丢失问题
    "force": false,                  // 不强制嗅探：避免干扰特殊的非标私有协议
    "sniff": {
      "TLS": { "ports": [443, 8443, 2083, 2087, 2096] }, // 识别 HTTPS 流量，提取真实域名
      "HTTP": { "ports": [80, "8080-8880"], "override-destination": true }, // 识别 HTTP 流量
      "QUIC": { "ports": [443, 8443] } // 核心：让 YouTube 等 QUIC 流量准确命中代理规则
    }
  };
     // --- 4. DNS 物理隔离 ---
  config["dns"] = {
    ...(config["dns"] || {}), // 继承原生 YAML 中的所有 DNS 配置（如 listen, enhanced-mode 等）
    "fake-ip-persist": true                   // 确保即便重启，之前的 Fake-IP 映射依然有效，秒连网络
  };

  // --- 5. 策略组定义 ---
  config["proxy-groups"] = [
    { name: "🚀 节点选择", type: "select", proxies: ["🇯🇵 日本优选", "🇭🇰 香港优选", "DIRECT"], "include-all": true },
    { name: "🇯🇵 日本优选", type: "select", filter: "(?i)JP|日本|Japan", url: "https://www.apple.com/library/test/success.html", interval: 300, tolerance: 50, "include-all": true },
    { name: "🇭🇰 香港优选", type: "select", filter: "(?i)HK|香港|HongKong|Hong Kong", url: "https://www.apple.com/library/test/success.html", interval: 300, tolerance: 50, "include-all": true },

    // 独立策略组
    { name: "🎮 GAME", type: "select", proxies: ["🚀 节点选择", "DIRECT"], "include-all": true },
    { name: "🐋 DeepSeek", type: "select", proxies: ["🚀 节点选择", "DIRECT"], "include-all": true },
    { name: "🎵 Spotify", type: "select", proxies: ["🚀 节点选择", "DIRECT"], "include-all": true },
    { name: "🔍 Bing", type: "select", proxies: ["DIRECT", "🚀 节点选择"], "include-all": true },
    { name: "🔍 YAHOO&AOL", type: "select", proxies: ["🚀 节点选择", "DIRECT"], "include-all": true },
    { name: "🍎 苹果服务", type: "select", proxies: ["DIRECT", "🚀 节点选择"], "include-all": true },
    { name: "🪟 微软服务", type: "select", proxies: ["DIRECT", "🚀 节点选择"], "include-all": true },
    { name: "☁️ iCloud", type: "select", proxies: ["DIRECT", "🚀 节点选择"], "include-all": true },
    { name: "☁️ OneDrive", type: "select", proxies: ["🚀 节点选择", "DIRECT"], "include-all": true },
    { name: "🚀 Speedtest", type: "select", proxies: ["🚀 节点选择", "DIRECT"], "include-all": true },
    { name: "🎮 Steam CN", type: "select", proxies: ["DIRECT", "🚀 节点选择"], "include-all": true },
    { name: "🎮 Steam 商店/聊天/工坊", type: "select", proxies: ["🚀 节点选择", "DIRECT"], "include-all": true },

    // 基础策略
    { name: "🚫 广告拦截", type: "select", proxies: ["REJECT", "DIRECT"] },
    { name: "🐟 漏网之鱼", type: "select", proxies: ["🚀 节点选择", "DIRECT"] }
  ];

  // --- 6. 规则集配置 (Rule Providers) ---
  config["rule-providers"] = {
    // 广告拦截
    reject: { type: "http", behavior: "domain", interval: 86400, url: "https://raw.githubusercontent.com/Loyalsoldier/clash-rules/release/reject.txt", path: "./ruleset/reject.yaml" },
    // 直连
    direct: { type: "http", behavior: "domain", interval: 86400, url: "https://raw.githubusercontent.com/Loyalsoldier/clash-rules/release/direct.txt", path: "./ruleset/direct.yaml" },
    // 代理 
    proxy: { type: "http", behavior: "domain", interval: 86400, url: "https://raw.githubusercontent.com/Loyalsoldier/clash-rules/release/proxy.txt", path: "./ruleset/proxy.yaml" },
    gfw: { type: "http", behavior: "domain", interval: 86400, url: "https://raw.githubusercontent.com/Loyalsoldier/clash-rules/release/gfw.txt", path: "./ruleset/gfw.yaml" },
 
    // 策略组
    microsoft: { type: "http", behavior: "classical", interval: 86400, url: "https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/refs/heads/master/rule/Clash/Microsoft/Microsoft_No_Resolve.yaml", path: "./ruleset/microsoft.yaml" },
    apple: { type: "http", behavior: "classical", interval: 86400, url: "https://github.com/blackmatrix7/ios_rule_script/raw/refs/heads/master/rule/Clash/Apple/Apple_Classical_No_Resolve.yaml", path: "./ruleset/apple.yaml" },
    icloud: { type: "http", behavior: "classical", interval: 86400, url: "https://github.com/blackmatrix7/ios_rule_script/raw/refs/heads/master/rule/Clash/iCloud/iCloud_No_Resolve.yaml", path: "./ruleset/icloud.yaml" },
    onedrive: { type: "http", behavior: "classical", interval: 86400, url: "https://github.com/blackmatrix7/ios_rule_script/raw/refs/heads/master/rule/Clash/OneDrive/OneDrive_No_Resolve.yaml", path: "./ruleset/onedrive.yaml" },
    github: { type: "http", behavior: "classical", interval: 86400, url: "https://github.com/blackmatrix7/ios_rule_script/raw/refs/heads/master/rule/Clash/GitHub/GitHub_No_Resolve.yaml", path: "./ruleset/github.yaml" },
    aol: { type: "http", behavior: "classical", interval: 86400, url: "https://github.com/blackmatrix7/ios_rule_script/raw/refs/heads/master/rule/Clash/AOL/AOL_No_Resolve.yaml", path: "./ruleset/aol.yaml" },
    yahoo: { type: "http", behavior: "classical", interval: 86400, url: "https://raw.githubusercontent.com/Fyftydt/personal-clash-rules/refs/heads/main/yahoo.yaml", path: "./ruleset/yahoo.yaml" },
    bing: { type: "http", behavior: "classical", interval: 86400, url: "https://github.com/blackmatrix7/ios_rule_script/raw/refs/heads/master/rule/Clash/Bing/Bing_No_Resolve.yaml", path: "./ruleset/bing.yaml" },
    spotify: { type: "http", behavior: "classical", interval: 86400, url: "https://github.com/blackmatrix7/ios_rule_script/raw/refs/heads/master/rule/Clash/Spotify/Spotify_No_Resolve.yaml", path: "./ruleset/spotify.yaml" },
    deepseek: { type: "http", behavior: "classical", interval: 86400, url: "https://github.com/Fyftydt/personal-clash-rules/raw/refs/heads/main/deepseek.yaml", path: "./ruleset/deepseek.yaml" },
    telegram: { type: "http", behavior: "classical", interval: 86400, url: "https://github.com/blackmatrix7/ios_rule_script/raw/refs/heads/master/rule/Clash/Telegram/Telegram_No_Resolve.yaml", path: "./ruleset/telegram.yaml" },
    steam_direct: { type: "http", behavior: "classical", interval: 86400, url: "https://github.com/Fyftydt/personal-clash-rules/raw/refs/heads/main/steam_direct.yaml", path: "./ruleset/steam_direct.yaml" },
    steam_proxy: { type: "http", behavior: "classical", interval: 86400, url: "https://github.com/Fyftydt/personal-clash-rules/raw/refs/heads/main/steam_proxy.yaml", path: "./ruleset/steam_proxy.yaml" },

    // 常用软件
    applications: { type: "http", behavior: "classical", interval: 86400, url: "https://raw.githubusercontent.com/Loyalsoldier/clash-rules/release/applications.txt", path: "./ruleset/applications.yaml" },
    proxy_application: { type: "http", behavior: "classical", interval: 86400, url: "https://github.com/Fyftydt/personal-clash-rules/raw/refs/heads/main/proxy-application.yaml", path: "./ruleset/proxy_application.yaml" },
    direct_application: { type: "http", behavior: "classical", interval: 86400, url: "https://github.com/Fyftydt/personal-clash-rules/raw/refs/heads/main/direct-application.yaml", path: "./ruleset/direct_application.yaml" },
    game_ruleset: { type: "http", behavior: "classical", interval: 86400, url: "https://github.com/Fyftydt/personal-clash-rules/raw/refs/heads/main/game-ruleset.yaml", path: "./ruleset/game_ruleset.yaml" },

    // 网站
    proxy_website: { type: "http", behavior: "classical", interval: 86400, url: "https://github.com/Fyftydt/personal-clash-rules/raw/refs/heads/main/proxy_website.yaml", path: "./ruleset/proxy_website.yaml" },
    direct_website: { type: "http", behavior: "classical", interval: 86400, url: "https://github.com/Fyftydt/personal-clash-rules/raw/refs/heads/main/direct_website.yaml", path: "./ruleset/direct_website.yaml" },

    // 私有专用域名
    private: { type: "http", behavior: "domain", interval: 86400, url: "https://raw.githubusercontent.com/Loyalsoldier/clash-rules/release/private.txt", path: "./ruleset/private.yaml" },
    // 在“白名单模式”中被用来识别并分流那些明显不属于中国的国外网站
    "tld-not-cn": { type: "http", behavior: "domain", interval: 86400, url: "https://raw.githubusercontent.com/Loyalsoldier/clash-rules/release/tld-not-cn.txt", path: "./ruleset/tld-not-cn.yaml" },
    // 中国大陆 IP 段
    cncidr: { type: "http", behavior: "ipcidr", interval: 86400, url: "https://raw.githubusercontent.com/Loyalsoldier/clash-rules/release/cncidr.txt", path: "./ruleset/cncidr.yaml" },
    // 保留的内网 IP 地址
    lancidr: { type: "http", behavior: "ipcidr", interval: 86400, url: "https://raw.githubusercontent.com/Loyalsoldier/clash-rules/release/lancidr.txt", path: "./ruleset/lancidr.yaml" }
  };

    // --- 7. GeoX 数据库与底层数据格式配置 ---
  config["geodata-mode"] = true; // 开启高阶 geodata 模式（取代旧版 mmdb 单一模式）
  config["geox-url"] = {
    "geoip": "https://github.com/Loyalsoldier/v2ray-rules-dat/releases/latest/download/geoip.dat",
    "geosite": "https://github.com/Loyalsoldier/v2ray-rules-dat/releases/latest/download/geosite.dat",
    "mmdb": "https://github.com/MetaCubeX/meta-rules-dat/releases/download/latest/country.mmdb",
    "asn": "https://github.com/MetaCubeX/meta-rules-dat/releases/download/latest/GeoLite2-ASN.mmdb"
  };  


  // --- 8. 路由规则 (白名单模式) --- 优先级 DOMAIN/DOMAIN-SUFFIX GEOSITE IP-ASN RULE-SET GEOIP   IPASN和GEOIP必须加no-resolve否则可能DNS泄露
  config["rules"] = [
    // 广告拦截
    "GEOSITE,category-ads-all,🚫 广告拦截",
    "RULE-SET,reject,🚫 广告拦截",
 
    // 局域网 私有 IP
    "GEOSITE,private,DIRECT",
    "GEOIP,lan,DIRECT,no-resolve",
    "RULE-SET,lancidr,DIRECT,no-resolve",         
    "RULE-SET,private,DIRECT", 

    // 必须代理  
    "RULE-SET,github,🚀 节点选择",
    "RULE-SET,telegram,🚀 节点选择",  

    // 网站
    "RULE-SET,proxy_website,🚀 节点选择",
    "RULE-SET,direct_website,DIRECT",

    // 应用程序
    "RULE-SET,applications,DIRECT", 
    "RULE-SET,proxy_application,🚀 节点选择",
    "RULE-SET,direct_application,DIRECT",

    // GAME Ruleset
    "RULE-SET,game_ruleset,🎮 GAME",

    // Steam  
    "RULE-SET,steam_direct,🎮 Steam CN",
    "RULE-SET,steam_proxy,🎮 Steam 商店/聊天/工坊",

    // 独立策略组   
    "RULE-SET,spotify,🎵 Spotify",
    "RULE-SET,deepseek,🐋 DeepSeek",
    "RULE-SET,aol,🔍 YAHOO&AOL",
    "RULE-SET,yahoo,🔍 YAHOO&AOL",
    "RULE-SET,bing,🔍 Bing",
    "RULE-SET,onedrive,☁️ OneDrive",
    "RULE-SET,icloud,☁️ iCloud",
    "RULE-SET,apple,🍎 苹果服务",
    "GEOSITE,apple-cn,🍎 苹果服务",
    "RULE-SET,microsoft,🪟 微软服务",  //部分与Github Bing 冲突，放下面
    "DOMAIN-SUFFIX,speedtest.net,🚀 Speedtest", // 测速流量分流  

    // 国内网站直连
    "GEOSITE,cn,DIRECT",  // 中国大陆域名一律直连
    "GEOIP,CN,DIRECT,no-resolve",  // 中国 IP 
    "RULE-SET,cncidr,DIRECT,no-resolve",  // 中国大陆 IP 直连
    "RULE-SET,direct,DIRECT",
      
    // 代理
    "GEOSITE,geolocation-!cn,🚀 节点选择",
    "RULE-SET,proxy,🚀 节点选择",
    "RULE-SET,gfw,🚀 节点选择",
    "RULE-SET,tld-not-cn,🚀 节点选择",  // 拦截非 .cn 域名进入代理层  

    // 不在白名单内的强制代理
    "MATCH,🐟 漏网之鱼"    // 兜底规则：不符合上述所有条件的全部走代理
  ];
 
  return config;  // 返回修改后的配置，激活引擎
}