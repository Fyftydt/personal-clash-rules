# personal-clash-rules
EXAMPLE (Clash verge JS Sprit):

deepseek: { type: "http", behavior: "classical", interval: 86400, url: "https://raw.githubusercontent.com/Fyftydt/personal-clash-rules/refs/heads/main/deepseek.yaml", path: "./ruleset/deepseek.yaml" },

{ name: "🐋 DeepSeek", type: "select", proxies: ["🚀 节点选择", "DIRECT"], "include-all": true },

"RULE_SET,deepseek,🐋 DeepSeek",


{ name: "🪟 微软CDN", type: "select", proxies: ["🚀 节点选择", "DIRECT"], "include-all": true },

microsoft_cdn: { type: "http", behavior: "classical", interval: 86400, url: "https://raw.githubusercontent.com/Fyftydt/personal-clash-rules/refs/heads/main/microsoft_cdn.yaml", path: "./ruleset/microsoft_cdn.yaml" },

"RULE-SET,microsoft_cdn,🪟 微软CDN",


proxy_website: { type: "http", behavior: "classical", interval: 86400, url: "https://github.com/Fyftydt/personal-clash-rules/raw/refs/heads/main/proxy_website.yaml", path: "./ruleset/proxy_website.yaml" },

direct_website: { type: "http", behavior: "classical", interval: 86400, url: "https://github.com/Fyftydt/personal-clash-rules/raw/refs/heads/main/direct_website.yaml", path: "./ruleset/direct_website.yaml" },


    "RULE-SET,proxy_website,🚀 节点选择",
    "RULE-SET,direct_website,DIRECT",
