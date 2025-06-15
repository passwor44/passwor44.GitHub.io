/*
                    
                    
                    
                    
                    
                    
ppppp   ppppppppp   
p::::ppp:::::::::p  
p:::::::::::::::::p 
pp::::::ppppp::::::p
 p:::::p     p:::::p
 p:::::p     p:::::p
 p:::::p     p:::::p
 p:::::p    p::::::p
 p:::::ppppp:::::::p
 p::::::::::::::::p 
 p::::::::::::::pp  
 p::::::pppppppp    
 p:::::p            
 p:::::p            
p:::::::p           
p:::::::p           
p:::::::p           
ppppppppp           
                    
*/

addLayer("p", {
        name: "prestige", // This is optional, only used in a few places, If absent it just uses the layer id.
        symbol: "ρ", // This appears on the layer's node. Default is the id with the first letter capitalized
        position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
        color: "#3162b2",
        requires: new Decimal(10), // Can be a function that takes requirement increases into account
        resource: "声哇", // Name of prestige currency
        baseResource: "type", // Name of resource prestige is based on
        baseAmount() {return player.points}, // Get the current amount of baseResource
        type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
        exponent() { return ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?0.75:0.5 }, // Prestige currency exponent
        gainMult() { // Calculate the multiplier for main currency from bonuses
            mult = new Decimal(1)
			if (hasAchievement("a", 13)) mult = mult.times(1.1);
			if (hasAchievement("a", 32)) mult = mult.times(2);
			if (hasUpgrade("p", 21)) mult = mult.times(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?1e50:1.8);
			if (hasUpgrade("p", 23)) mult = mult.times(upgradeEffect("p", 23));
			if (hasUpgrade("p", 41)) mult = mult.times(upgradeEffect("p", 41));
			if (hasUpgrade("b", 11)) mult = mult.times(upgradeEffect("b", 11));
			if (hasUpgrade("g", 11)) mult = mult.times(upgradeEffect("g", 11));
			if (player.t.unlocked) mult = mult.times(tmp.t.enEff);
			if (player.e.unlocked) mult = mult.times(tmp.e.buyables[11].effect.first);
			if (player.s.unlocked) mult = mult.times(buyableEffect("s", 11));
			if (hasUpgrade("e", 12)) mult = mult.times(upgradeEffect("e", 12));
			if (hasUpgrade("b", 31)) mult = mult.times(upgradeEffect("b", 31));
            return mult
        },
        gainExp() { // Calculate the exponent on main currency from bonuses
            let exp = new Decimal(1)
			if (hasUpgrade("p", 31)) exp = exp.times(1.05);
			return exp;
        },
        row: 0, // Row the layer is in on the tree (0 is the first row)
        hotkeys: [
            {key: "p", description: "按 P 进行声望重置。", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
        ],
        layerShown(){return true},
		passiveGeneration() { return (hasMilestone("g", 1)&&player.ma.current!="p")?1:0 },
		doReset(resettingLayer) {
			let keep = [];
			if (hasMilestone("b", 1) && resettingLayer=="b") keep.push("upgrades")
			if (hasMilestone("g", 1) && resettingLayer=="g") keep.push("upgrades")
			if (hasMilestone("e", 14) && resettingLayer=="e") keep.push("upgrades")
			if (hasMilestone("t", 15) && resettingLayer=="t") keep.push("upgrades")
			if (hasMilestone("s", 15) && resettingLayer=="s") keep.push("upgrades")
			if (hasAchievement("a", 41)) keep.push("upgrades")
			if (layers[resettingLayer].row > this.row) layerDataReset("p", keep)
		},
		startData() { return {
			unlocked: false,
			points: new Decimal(0),
			best: new Decimal(0),
			total: new Decimal(0),
			pseudoUpgs: [],
			first: 0,
		}},
		upgrades: {
			rows: 4,
			cols: 4,
			11: {
				title: "开门见山",
				description: "每秒获得 128 点数。",
				cost() { return tmp.h.costMult11.times(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?256:0.2).pow(tmp.h.costExp11*128) },
			},
			12: {
				title: "🍲增益",
				description: "火锅好吃。",
				cost() { return tmp.h.costMult11.times(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?10:1).pow(tmp.h.costExp11) },
				effect() {
					if (inChallenge("ne", 116)) return new Decimal(1);
					
					let eff = player.p.points.plus(6).pow(1500);
					if (hasUpgrade("g", 14)) eff = eff.pow(9300);
					if (hasUpgrade("g", 24)) eff = eff.pow(10000);
					if (hasUpgrade("g", 34) && player.i.buyables[12].gte(2)) eff = eff.pow(1e5)
					
					if (hasChallenge("h", 22)) eff = softcap("p12_h22", eff);
					else eff = softcap("p12", eff);
					
					if (hasUpgrade("p", 14)) eff = eff.pow(1e7);
					if (hasUpgrade("hn", 14)) eff = eff.pow(1e9);
					if (hasUpgrade("b", 34) && player.i.buyables[12].gte(1)) eff = eff.pow(upgradeEffect("b", 34));
					if ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false) eff = eff.pow(1.1);
					
					return eff;
				},
				unlocked() { return hasUpgrade("p", 11) },
				effectDisplay() { return format(tmp.p.upgrades[12].effect)+"x" },
				formula() { 
					if (inChallenge("ne", 11)) return "DISABLED";
				
					let exp = new Decimal(0.5*(hasUpgrade("g", 14)?1.5:1)*(hasUpgrade("g", 24)?1.4666667:1));
					if (hasUpgrade("g", 34) && player.i.buyables[12].gte(2)) exp = exp.times(1.4333333);
					if (hasUpgrade("b", 34) && player.i.buyables[12].gte(1)) exp = exp.times(upgradeEffect("b", 34));
					if ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false) exp = exp.times(1.1);
					let f = "(x+2)^"+format(exp)
					if (upgradeEffect("p", 12).gte("1e3500")) {
						if (hasChallenge("h", 22)) f = "10^(sqrt(log(x+2))*"+format(Decimal.mul(exp, 3500).sqrt())+")"
						else f = "log(x+2)*"+format(Decimal.div("1e3500",3500).times(exp))
					}
					if (hasUpgrade("p", 14)) f += "^"+(hasUpgrade("hn", 14)?3.15:3)
					return f;
				},
			},
			13: {
				title: "那很协同了",
				description: "获取加成获取点数。",
				cost() { return tmp.h.costMult11.times(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?50:5e-198).pow(tmp.h.costExp11) },
				effect() { 
					let eff = player.points.plus(1).log10().pow(0.75).plus(1);
					if (hasUpgrade("p", 33)) eff = eff.pow(upgradeEffect("p", 33));
					if (hasUpgrade("g", 15)) eff = eff.pow(upgradeEffect("g", 15));
					if (hasUpgrade("hn", 13)) eff = eff.pow(upgradeEffect("hn", 13));
					if ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false) eff = eff.pow(75);
					return eff;
				},
				unlocked() { return hasUpgrade("p", 12) },
				effectDisplay() { return format(tmp.p.upgrades[13].effect)+"x" },
				formula() { 
					let exp = new Decimal(1);
					if (hasUpgrade("p", 33)) exp = exp.times(upgradeEffect("p", 33));
					if (hasUpgrade("g", 15)) exp = exp.times(upgradeEffect("g", 15));
					if (hasUpgrade("hn", 13)) exp = exp.times(upgradeEffect("hn", 13));
					if ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false) exp = exp.times(75);
					return "(log(x+1)^0.75+1)"+(exp.gt(1)?("^"+format(exp)):"")
				},
			},
			14: {
				title: "萎了",
				description: "<b></b> 被卡住了。",
				cost() { return tmp.h.costMult11.times(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?"1e589":"1e3").pow(tmp.h.costExp11) },
				pseudoUnl() { return hasUpgrade("hn", 11) && hasUpgrade("p", 13) },
				pseudoReq: '需要: 在 "减产" 中达到 1 丸子',
				pseudoCan() { return player.p.points.gte("1")&&inChallenge("h", 42) },
				unlocked() { return player.p.pseudoUpgs.includes(Number(this.id)) },
			},
			21: {
				title: "飞起来",
				description() { return "声望致力于让你飞到诡异不要来见他，所以给你加成了 "+(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?"1e111111111":"1e114514")+"%。" },
				cost() { return tmp.h.costMult11.times(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?1e171:2).pow(tmp.h.costExp11) },
				unlocked() { return hasAchievement("a", 21)&&hasUpgrade("p", 11) },
			},
			22: {
				title: "力量升级",
				description: "点数获取基于你已购买的声望升级更快。",
				cost() { return tmp.h.costMult11.times(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?1e262:75).pow(tmp.h.costExp11) },
				effect() {
					let eff = Decimal.pow(1.4, player.p.upgrades.length);
					if (hasUpgrade("p", 32)) eff = eff.pow(2);
					if (hasUpgrade("hn", 22)) eff = eff.pow(upgradeEffect("hn", 22))
					if (hasUpgrade("hn", 32)) eff = eff.pow(7);
					if ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false) eff = eff.pow(40);
					return eff;
				},
				unlocked() { return hasAchievement("a", 21)&&hasUpgrade("p", 12) },
				effectDisplay() { return format(tmp.p.upgrades[22].effect)+"x" },
				formula() { 
					let exp = new Decimal(hasUpgrade("p", 32)?2:1);
					if (hasUpgrade("hn", 22)) exp = exp.times(upgradeEffect("hn", 22));
					if (hasUpgrade("hn", 32)) exp = exp.times(7);
					if ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false) exp = exp.times(40);
					return exp.gt(1)?("(1.4^x)^"+format(exp)):"1.4^x" 
				},
			},
			23: {
				title: "反转声望增益",
				description: "点数加成声望获取。",
				cost() { return tmp.h.costMult11.times(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?1e305:5e3).pow(tmp.h.costExp11) },
				effect() {
					let eff = player.points.plus(1).log10().cbrt().plus(1);
					if (hasUpgrade("p", 33)) eff = eff.pow(upgradeEffect("p", 33));
					if (hasUpgrade("g", 23)) eff = eff.pow(upgradeEffect("g", 23));
					if (hasUpgrade("hn", 23)) eff = eff.pow(upgradeEffect("hn", 23));
					if ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false) eff = eff.pow(1.5);
					return eff;
				},
				unlocked() { return hasAchievement("a", 21)&&hasUpgrade("p", 13) },
				effectDisplay() { return format(tmp.p.upgrades[23].effect)+"x" },
				formula() { 
					let exp = new Decimal(1);
					if (hasUpgrade("p", 33)) exp = exp.times(upgradeEffect("p", 33));
					if (hasUpgrade("g", 23)) exp = exp.times(upgradeEffect("g", 23));
					if (hasUpgrade("hn", 23)) exp = exp.times(upgradeEffect("hn", 23));
					if ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false) exp = exp.times(1.5);
					return exp.gt(1)?("(log(x+1)^(1/3)+1)^"+format(exp)):"log(x+1)^(1/3)+1"
				},
			},
			24: {
				title: "质能",
				description: "差旋层电浆效果使用更好的公式 (log(log(x+1)+1)*10+1 -> 10^cbrt(log(x+1)))。",
				cost() { return tmp.h.costMult11.times(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?"1e11435":"e5070000").pow(tmp.h.costExp11) },
				pseudoUnl() { return hasUpgrade("hn", 11) && (hasUpgrade("p", 14)||hasUpgrade("p", 23)) },
				pseudoReq: "需要: 250 恶魂（有幽灵）",
				pseudoCan() { return player.ps.souls.gte(250) && player.ps.buyables[11].eq(0) },
				unlocked() { return player.p.pseudoUpgs.includes(Number(this.id)) },
				style: {"font-size": "9px" },
			},
			31: {
				title: "我们需要更多声望",
				description: "声望获取提升至 1.05 次幂。",
				cost() { return tmp.h.costMult11.times(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?"1e316":1e45).pow(tmp.h.costExp11) },
				unlocked() { return hasAchievement("a", 23)&&hasUpgrade("p", 21) },
			},
			32: {
				title: "仍旧无用",
				description: "平方 <b>力量升级</b> 效果。",
				cost() { return tmp.h.costMult11.times(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?"1e355":1e56).pow(tmp.h.costExp11) },
				unlocked() { return hasAchievement("a", 23)&&hasUpgrade("p", 22) },
			},
			33: {
				title: "列长",
				description: "总声望加成上面两个升级的效果",
				cost() { return tmp.h.costMult11.times(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?"1e436":1e60).pow(tmp.h.costExp11) },
				effect() { return player.p.total.plus(1).log10().plus(1).log10().div(5).plus(1).times(hasUpgrade("hn", 33) ? upgradeEffect("hn", 33) : 1) },
				unlocked() { return hasAchievement("a", 23)&&hasUpgrade("p", 23) },
				effectDisplay() { return "^"+format(tmp.p.upgrades[33].effect) },
				formula() { return hasUpgrade("hn", 33) ? ("(log(log(x+1)+1)/5+1)*"+format(upgradeEffect("hn", 33))) : "log(log(x+1)+1)/5+1" },
			},
			34: {
				title: "阳光潜能",
				description: "阳光加成阳光获取。",
				cost() { return tmp.h.costMult11.times(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?"1e11467":"ee7").pow(tmp.h.costExp11) },
				pseudoUnl() { return hasUpgrade("hn", 11) && (hasUpgrade("p", 24)||hasUpgrade("p", 33)) },
				pseudoReq: "需要: 30 成就",
				pseudoCan() { return player.a.achievements.length>=30 },
				unlocked() { return player.p.pseudoUpgs.includes(Number(this.id)) },
				effect() { return player.o.points.plus(1).log10().plus(1).log10().plus(1).log10().plus(1).times((hasUpgrade("hn", 34)) ? upgradeEffect("hn", 34) : 1) },
				effectDisplay() { return format(tmp.p.upgrades[34].effect)+"x" },
				formula: "log(log(log(x+1)+1)+1)+1",
			},
			41: {
				title: "声望递归",
				description: "声望加成声望获取。",
				cost() { return tmp.h.costMult11.times(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?"1e9570":"1e4460000").pow(tmp.h.costExp11) },
				pseudoUnl() { return hasUpgrade("hn", 11) && hasUpgrade("p", 31) },
				pseudoReq: "需要: 25 总荣耀",
				pseudoCan() { return player.hn.total.gte(25) },
				unlocked() { return player.p.pseudoUpgs.includes(Number(this.id)) },
				effect() { 
					let eff = Decimal.pow(10, player.p.points.plus(1).log10().pow(.8));
					if (hasUpgrade("hn", 41)) eff = eff.pow(upgradeEffect("hn", 41));
					return eff;
				},
				effectDisplay() { return format(tmp.p.upgrades[41].effect)+"x" },
				formula() { return "10^(log(x+1)^0.8)"+(hasUpgrade("hn", 41)?("^"+format(upgradeEffect("hn", 41))):"") },
			},
			42: {
				title: "空间感知",
				description: "建筑价格减缓 50%。",
				cost() { return tmp.h.costMult11.times(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?"1e11445":"e5960000").pow(tmp.h.costExp11) },
				pseudoUnl() { return hasUpgrade("hn", 11) && hasUpgrade("p", 32) },
				pseudoReq: "需要: 1e100 阳光",
				pseudoCan() { return player.o.points.gte(1e100) },
				unlocked() { return player.p.pseudoUpgs.includes(Number(this.id)) },
			},
			43: {
				title: "增幅器潜能",
				description: "QE 加成增幅器效果。",
				cost() { return tmp.h.costMult11.times(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?"1e11467":"e8888888").pow(tmp.h.costExp11) },
				pseudoUnl() { return hasUpgrade("hn", 11) && hasUpgrade("p", 33) },
				pseudoReq: "需要: e10,000,000 点数",
				pseudoCan() { return player.points.gte("ee7") },
				unlocked() { return player.p.pseudoUpgs.includes(Number(this.id)) },
			},
			44: {
				title: "法术词典",
				description: "增幅器推迟前两个魔法的软上限。",
				cost() { return tmp.h.costMult11.times(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?"1e11456":"e6500000").pow(tmp.h.costExp11) },
				pseudoUnl() { return hasUpgrade("hn", 11) && hasUpgrade("p", 33) },
				pseudoReq: "需要: 150,000 第一建筑",
				pseudoCan() { return player.s.buyables[11].gte(1.5e5) },
				unlocked() { return player.p.pseudoUpgs.includes(Number(this.id)) },
				effect() { return player.b.points.plus(1).pow(3) },
				effectDisplay() { return format(tmp.p.upgrades[44].effect)+"x 延后" },
				formula: "(x+1)^3",
				style: {"font-size": "9px"},
			},
		},
})
/*
                    
bbbbbbbb            
b::::::b            
b::::::b            
b::::::b            
 b:::::b            
 b:::::bbbbbbbbb    
 b::::::::::::::bb  
 b::::::::::::::::b 
 b:::::bbbbb:::::::b
 b:::::b    b::::::b
 b:::::b     b:::::b
 b:::::b     b:::::b
 b:::::b     b:::::b
 b:::::bbbbbb::::::b
 b::::::::::::::::b 
 b:::::::::::::::b  
 bbbbbbbbbbbbbbbb   
                    
                    
                    
                    
                    
                    
                    
*/
addLayer("b", {
        name: "booster", // This is optional, only used in a few places, If absent it just uses the layer id.
        symbol: "Bst", // This appears on the layer's node. Default is the id with the first letter capitalized
        position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
        color: "#808995",
        requires() { return new Decimal(200).times((player.b.unlockOrder&&!player.b.unlocked)?5000:1) }, // Can be a function that takes requirement increases into account
        resource: "请输入文本", // Name of prestige currency
        baseResource: "声望树节点", // Name of resource prestige is based on
        baseAmount() {return player.points}, // Get the current amount of baseResource
        type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
		branches: ["p"],
        exponent() { return ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?0.75:1.25 }, // Prestige currency exponent
		base() { return ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?1.5:5 },
		gainMult() { 
			let mult = new Decimal(1);
			if (hasUpgrade("b", 23)) mult = mult.div(upgradeEffect("b", 23));
			if (player.s.unlocked) mult = mult.div(buyableEffect("s", 13));
			return mult;
		},
		canBuyMax() { return hasMilestone("b", 1) },
        row: 1, // Row the layer is in on the tree (0 is the first row)
        hotkeys: [
            {key: "b", description: "按 B 进行增幅器重置。", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
        ],
        layerShown(){return player.p.unlocked},
		automate() {},
		resetsNothing() { return hasMilestone("t", 4)&&player.ma.current!="b" },
		addToBase() {
			let base = new Decimal(0);
			if (hasUpgrade("b", 12)) base = base.plus(upgradeEffect("b", 12));
			if (hasUpgrade("b", 13)) base = base.plus(upgradeEffect("b", 13));
			if (hasUpgrade("t", 11)) base = base.plus(upgradeEffect("t", 11));
			if (hasUpgrade("e", 11)) base = base.plus(upgradeEffect("e", 11).b);
			if (player.e.unlocked) base = base.plus(layers.e.buyables[11].effect().second);
			if (player.s.unlocked) base = base.plus(buyableEffect("s", 12));
			if (hasUpgrade("t", 25)) base = base.plus(upgradeEffect("t", 25));
			return base;
		},
		effectBase() {
			let base = new Decimal(2);
			
			// ADD
			base = base.plus(tmp.b.addToBase);
			
			// MULTIPLY
			if (player.sb.unlocked) base = base.times(tmp.sb.effect);
			if (hasUpgrade("q", 12)) base = base.times(upgradeEffect("q", 12));
			if (hasUpgrade("q", 34)) base = base.times(upgradeEffect("q", 34));
			if (player.m.unlocked) base = base.times(tmp.m.buyables[11].effect);
			if (hasUpgrade("b", 24) && player.i.buyables[12].gte(1)) base = base.times(upgradeEffect("b", 24));
			if (inChallenge("h", 12)) base = base.div(tmp.h.baseDiv12);
			if ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes("t"):false) base = base.times(tmp.t.effLimBaseMult);
			
			return base.pow(tmp.b.power);
		},
		power() {
			let power = new Decimal(1);
			if (player.m.unlocked) power = power.times(player.m.spellTimes[12].gt(0)?1.05:1);
			return power;
		},
		effect() {
			if ((!unl(this.layer))||inChallenge("ne", 11)) return new Decimal(1);
			return Decimal.pow(tmp.b.effectBase, player.b.points.plus(tmp.sb.spectralTotal)).max(0).times(hasUpgrade("p", 43)?tmp.q.enEff:1);
		},
		effectDescription() {
			return "增幅点数获取 "+format(tmp.b.effect)+"x"+(tmp.nerdMode?(inChallenge("ne", 11)?"\n (禁用)":("\n(每个 "+format(tmp.b.effectBase)+"x)")):"")
		},
		doReset(resettingLayer) {
			let keep = [];
			if (hasMilestone("e", 0) && resettingLayer=="e") keep.push("milestones")
			if (hasMilestone("t", 0) && resettingLayer=="t") keep.push("milestones")
			if (hasMilestone("s", 0) && resettingLayer=="s") keep.push("milestones")
			if (hasMilestone("q", 0)) keep.push("milestones")
			if (hasMilestone("t", 2) || hasAchievement("a", 64)) keep.push("upgrades")
			if (hasMilestone("e", 2) && resettingLayer=="e") keep.push("upgrades")
			if (layers[resettingLayer].row > this.row) layerDataReset("b", keep)
		},
		extraAmtDisplay() {
			if (tmp.sb.spectralTotal.eq(0)) return "";
			return "<h3 style='color: #8882ba; text-shadow: #7f78c4 0px 0px 10px;'> + "+formatWhole(tmp.sb.spectralTotal)+"</h3>"
		},
		startData() { return {
			unlocked: false,
			points: new Decimal(0),
			best: new Decimal(0),
			total: new Decimal(0),
			pseudoUpgs: [],
			first: 0,
			auto: false,
		}},
		autoPrestige() { return (hasMilestone("t", 3) && player.b.auto)&&player.ma.current!="b" },
		increaseUnlockOrder: ["g"],
		milestones: {
			0: {
				requirementDescription: "1 增幅器",
				done() { return player.b.best.gte(1) || hasAchievement("a", 41) || hasAchievement("a", 71) },
				effectDescription: "重置时保留声望升级。",
			},
			1: {
				requirementDescription: "2 增幅器",
				done() { return player.b.best.gte(2) || hasAchievement("a", 71) },
				effectDescription: "允许最大购买增幅器。",
			},
		},
		upgrades: {
			rows: 3,
			cols: 4,
			11: {
				title: "666还有联合",
				description: "最多增幅器加成声望获取。",
				cost() { return tmp.h.costMult11b.times(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?1438:3) },
				effect() { 
					let ret = player.b.best.sqrt().plus(1);
					if (hasUpgrade("b", 32)) ret = Decimal.pow(1.125, player.b.best).times(ret);
					if (hasUpgrade("s", 15)) ret = ret.pow(buyableEffect("s", 14).root(2.7));
					if (hasUpgrade("b", 14) && player.i.buyables[12].gte(1)) ret = ret.pow(upgradeEffect("b", 14));
					if (((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)) ret = ret.pow(1.5);
					return ret;
				},
				unlocked() { return player.b.unlocked },
				effectDisplay() { return format(tmp.b.upgrades[11].effect)+"x" },
				formula() { 
					let base = "sqrt(x)+25"
					if (hasUpgrade("b", 32)) base = "(sqrt(x)+25)*(2^x)"
					let exp = new Decimal(1)
					if (hasUpgrade("s", 15)) exp = exp.times(buyableEffect("s", 14).root(2.7));
					if (hasUpgrade("b", 14) && player.i.buyables[12].gte(1)) exp = exp.times(upgradeEffect("b", 14));
					if (((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)) exp = exp.times(1.5);
					let f = exp.gt(1)?("("+base+")^"+format(exp)):base;
					return f;
				},
			},
			12: {
				title: "换边I",
				description: "生成器加成增幅器底数。",
				cost() { return tmp.h.costMult11b.times(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?1250:7) },
				effect() {
					let ret = player.g.points.add(1).log10().sqrt().div(3).times(hasUpgrade("e", 14)?upgradeEffect("e", 14):1);
					if (hasUpgrade("b", 14) && player.i.buyables[12].gte(1)) ret = ret.pow(upgradeEffect("b", 14));
					return ret;
				},
				unlocked() { return player.b.unlocked&&player.g.unlocked },
				effectDisplay() { return "+"+format(tmp.b.upgrades[12].effect) },
				formula() { 
					let exp = new Decimal(1);
					if (hasUpgrade("b", 14) && player.i.buyables[12].gte(1)) exp = exp.times(upgradeEffect("b", 14));
					let f = "log(x+1)"+(hasUpgrade("e", 14)?("*"+format(upgradeEffect("e", 14).div(3))):"/3") 
					if (exp.gt(1)) f = "("+f+")^"+format(exp);
					return f;
				},
			},
			13: {
				title: "PB 肘击你木琴",
				description: "总声望加成增幅器底数。",
				cost() { return tmp.h.costMult11b.times(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?1436:8) },
				effect() { 
					let ret = player.p.total.add(1).log10().add(1).log10().div(3).times(hasUpgrade("e", 14)?upgradeEffect("e", 14):1) 
					if (hasUpgrade("b", 14) && player.i.buyables[12].gte(1)) ret = ret.pow(upgradeEffect("b", 14));
					return ret;
				},
				unlocked() { return player.b.unlocked&&player.b.best.gte(7) },
				effectDisplay() { return "+"+format(tmp.b.upgrades[13].effect) },
				formula() { 
					let exp = new Decimal(1)
					if (hasUpgrade("b", 14) && player.i.buyables[12].gte(1)) exp = exp.times(upgradeEffect("b", 14));
					let f = "log(log(x+1)+1)"+(hasUpgrade("e", 14)?("*"+format(upgradeEffect("e", 14).div(3))):"/3") 
					if (exp.gt(1)) f = "("+f+")^"+format(exp);
					return f;
				},
			},
			14: {
				title: "元连击",
				description: "超级增幅器加成前三个增幅器升级，<b>BP 连击</b> 直接加成点数获取。",
				cost() { return tmp.h.costMult11b.times(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?2088:2250) },
				pseudoUnl() { return player.i.buyables[12].gte(1)&&hasUpgrade("b", 13) },
				pseudoReq: "需要: 30 超级增幅器。",
				pseudoCan() { return player.sb.points.gte(30) },
				unlocked() { return player[this.layer].pseudoUpgs.includes(Number(this.id)) },
				effect() { return player.sb.points.plus(1) },
				effectDisplay() { return "^"+format(tmp[this.layer].upgrades[this.id].effect) },
				formula: "x+1",
				style: {"font-size": "9px"},
			},
			21: {
				title: "生成 Z^2",
				description: "平方 GP 增益。",
				cost() { return tmp.h.costMult11b.times(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?2000:9) },
				unlocked() { return hasUpgrade("b", 11) && hasUpgrade("b", 12) },
			},
			22: {
				title: "上到五楼",
				description: "GP 效果提升至 1.2 次幂。",
				cost() { return tmp.h.costMult11b.times(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?2075:15) },
				unlocked() { return hasUpgrade("b", 12) && hasUpgrade("b", 13) },
			},
			23: {
				title: "一折",
				description: "点数降低增幅器价格。",
				cost() { return tmp.h.costMult11b.times(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?2088:18) },
				effect() { 
					let ret = player.points.add(1).log10().add(1).pow(3.2);
					if (player.s.unlocked) ret = ret.pow(buyableEffect("s", 14));
					if (((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)) ret = ret.pow(1.5);
					return ret;
				},
				unlocked() { return hasUpgrade("b", 21) || hasUpgrade("b", 22) },
				effectDisplay() { return "/"+format(tmp.b.upgrades[23].effect) },
				formula() { return "(log(x+1)+1)^"+(player.s.unlocked?format(buyableEffect("s", 14).times(3.2).times(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?1.5:1)):"3.2") },
			},
			24: {
				title: "增幅递归",
				description: "增幅器加成增幅器底数。",
				cost() { return tmp.h.costMult11b.times(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?1438:2225) },
				pseudoUnl() { return player.i.buyables[12].gte(1)&&hasUpgrade("b", 23) },
				pseudoReq: "需要: 无妖术下获得 2,150 增幅器",
				pseudoCan() { return player.b.points.gte(2150) && player.m.hexes.eq(0) },
				unlocked() { return player[this.layer].pseudoUpgs.includes(Number(this.id)) },
				effect() { return player.b.points.plus(1).pow(500) },
				effectDisplay() { return format(tmp[this.layer].upgrades[this.id].effect)+"x" },
				formula: "(x+1)^500",
			},
			31: {
				title: "差的 BP 连击",
				description: "超级增幅器加成声望获取。",
				cost() { return tmp.h.costMult11b.times(103) },
				unlocked() { return hasAchievement("a", 41) },
				effect() { 
					let exp = ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?2e4:1
					return Decimal.pow(1e20, player.sb.points.pow(1.5)).pow(exp); 
				},
				effectDisplay() { return format(tmp.b.upgrades[31].effect)+"x" },
				formula() { 
					let exp = ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?2e4:1
					return "1e20^(x^1.5)"+(exp==1?"":("^"+format(exp)));
				},
			},
			32: {
				title: "好的 BP 连击",
				description() { return "<b>BP 连击</b> 使用更好的公式"+(tmp.nerdMode?" (sqrt(x+1) -> (1.125^x)*sqrt(x+1))":"")+"." },
				cost() { return tmp.h.costMult11b.times(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?1438:111) },
				unlocked() { return hasAchievement("a", 41) },
			},
			33: {
				title: "更更多添加物",
				description: "超级增幅器加成 <b>更多添加物</b>。",
				cost() { return tmp.h.costMult11b.times(118) },
				unlocked() { return hasAchievement("a", 41) },
				effect() { return player.sb.points.times(player.sb.points.gte(4)?2.6:2).plus(1).pow(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?3:1) },
				effectDisplay() { return format(tmp.b.upgrades[33].effect)+"x" },
				formula() { 
					let exp = ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?3:1
					let f = "x*"+(player.sb.points.gte(4)?"2.6":"2")+"+1"
					if (exp==1) return f;
					else return "("+f+")^"+format(exp);
				},
			},
			34: {
				title: "不可度量",
				description: "夸张地加成 <b>声望增益</b> 至指数（不受软上限影响）。",
				cost() { return tmp.h.costMult11b.times(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?2021:2275) },
				pseudoUnl() { return player.i.buyables[12].gte(1)&&hasUpgrade("b", 33) },
				pseudoReq: "需要: 1e15,000,000 声望在 <b>减产</b> 障碍中.",
				pseudoCan() { return player.p.points.gte("e1.5e7") && inChallenge("h", 42) },
				unlocked() { return player[this.layer].pseudoUpgs.includes(Number(this.id)) },
				effect() { return player.i.points.plus(1).root(4) },
				effectDisplay() { return "^"+format(tmp[this.layer].upgrades[this.id].effect) },
				formula: "(x+1)^0.25",
			},
		},
})
/*
                    
                    
                    
                    
                    
                    
   ggggggggg   ggggg
  g:::::::::ggg::::g
 g:::::::::::::::::g
g::::::ggggg::::::gg
g:::::g     g:::::g 
g:::::g     g:::::g 
g:::::g     g:::::g 
g::::::g    g:::::g 
g:::::::ggggg:::::g 
 g::::::::::::::::g 
  gg::::::::::::::g 
    gggggggg::::::g 
            g:::::g 
gggggg      g:::::g 
g:::::gg   gg:::::g 
 g::::::ggg:::::::g 
  gg:::::::::::::g  
    ggg::::::ggg    
       gggggg       
*/
addLayer("g", {
        name: "generator", // This is optional, only used in a few places, If absent it just uses the layer id.
        symbol: "G", // This appears on the layer's node. Default is the id with the first letter capitalized
        position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
        color: "#4bff9a",
        requires() { return new Decimal(200).times((player.g.unlockOrder&&!player.g.unlocked)?5000:1) }, // Can be a function that takes requirement increases into account
        resource: "生成器", // Name of prestige currency
        baseResource: "点数", // Name of resource prestige is based on
        baseAmount() {return player.points}, // Get the current amount of baseResource
        type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
		branches: ["p"],
        exponent() { return ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?1.1:1.25 }, // Prestige currency exponent
		base() { return ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?2.5:5 },
		gainMult() {
			let mult = new Decimal(1);
			if (hasUpgrade("g", 22)) mult = mult.div(upgradeEffect("g", 22));
			if (player.s.unlocked) mult = mult.div(buyableEffect("s", 13));
			return mult;
		},
		canBuyMax() { return hasMilestone("g", 2) },
        row: 1, // Row the layer is in on the tree (0 is the first row)
        hotkeys: [
            {key: "g", description: "按 G 进行生成器重置。", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
        ],
        layerShown(){return player.p.unlocked},
		automate() {},
		resetsNothing() { return hasMilestone("s", 4)&&player.ma.current!="g" },
		effBase() {
			let base = new Decimal(2);
			
			// ADD
			if (hasUpgrade("g", 12)) base = base.plus(upgradeEffect("g", 12));
			if (hasUpgrade("g", 13)) base = base.plus(upgradeEffect("g", 13));
			if (hasUpgrade("e", 11)) base = base.plus(upgradeEffect("e", 11).g);
			if (player.e.unlocked) base = base.plus(layers.e.buyables[11].effect().second);
			if (player.s.unlocked) base = base.plus(buyableEffect("s", 12));
			
			// MULTIPLY
			if (hasUpgrade("q", 12)) base = base.times(upgradeEffect("q", 12));
			if (inChallenge("h", 12)) base = base.div(tmp.h.baseDiv12)
			if (player.sg.unlocked) base = base.times(tmp.sg.enEff)
			if ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes("t"):false) base = base.times(tmp.t.effLimBaseMult);
			
			return base;
		},
		effect() {
			if ((!unl(this.layer))||inChallenge("ne", 11)) return new Decimal(0);
			let eff = Decimal.pow(this.effBase(), player.g.points.plus(tmp.sg.spectralTotal)).sub(1).max(0);
			if (hasUpgrade("g", 21)) eff = eff.times(upgradeEffect("g", 21));
			if (hasUpgrade("g", 25)) eff = eff.times(upgradeEffect("g", 25));
			if (hasUpgrade("t", 15)) eff = eff.times(tmp.t.enEff);
			if (hasUpgrade("s", 12)) eff = eff.times(upgradeEffect("s", 12));
			if (hasUpgrade("s", 13)) eff = eff.times(upgradeEffect("s", 13));
			if (player.q.unlocked) eff = eff.times(tmp.q.enEff);
			return eff;
		},
		effectDescription() {
			return "生成 "+format(tmp.g.effect)+" GP/sec"+(tmp.nerdMode?(inChallenge("ne", 11)?"\n (禁用)":("\n (每个 "+format(tmp.g.effBase)+"x)")):"")
		},
		extraAmtDisplay() {
			if (tmp.sg.spectralTotal.eq(0)) return "";
			return "<h3 style='color: #84b88a; text-shadow: #78c48f 0px 0px 10px;'> + "+formatWhole(tmp.sg.spectralTotal)+"</h3>"
		},
		update(diff) {
			if (player.g.unlocked) player.g.power = player.g.power.plus(tmp.g.effect.times(diff));
		},
		startData() { return {
			unlocked: false,
			points: new Decimal(0),
			best: new Decimal(0),
			total: new Decimal(0),
			power: new Decimal(0),
			pseudoUpgs: [],
			first: 0,
			auto: false,
		}},
		autoPrestige() { return (hasMilestone("s", 3) && player.g.auto)&&player.ma.current!="g" },
		powerExp() {
			let exp = new Decimal(1/3);
			if (hasUpgrade("b", 21)) exp = exp.times(2);
			if (hasUpgrade("b", 22)) exp = exp.times(1.2);
			if (hasUpgrade("q", 13)) exp = exp.times(1.25);
			if ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false) exp = exp.times(1.05);
			if (player.mc.upgrades.includes(11)) exp = exp.times(buyableEffect("mc", 12));
			if (hasAchievement("a", 152)) exp = exp.times(1.4);
			return exp;
		},
		powerEff() {
			if (!unl(this.layer)) return new Decimal(1);
			return player.g.power.plus(1).pow(this.powerExp());
		},
		doReset(resettingLayer) {
			let keep = [];
			player.g.power = new Decimal(0);
			if (hasMilestone("e", 0) && resettingLayer=="e") keep.push("milestones")
			if (hasMilestone("t", 0) && resettingLayer=="t") keep.push("milestones")
			if (hasMilestone("s", 0) && resettingLayer=="s") keep.push("milestones")
			if (hasMilestone("q", 0)) keep.push("milestones")
			if (hasMilestone("s", 2) || hasAchievement("a", 64)) keep.push("upgrades")
			if (hasMilestone("e", 2) && resettingLayer=="e") keep.push("upgrades")
			if (layers[resettingLayer].row > this.row) layerDataReset("g", keep)
		},
		tabFormat: ["main-display",
			"prestige-button",
			"blank",
			["display-text",
				function() {return '你有 ' + format(player.g.power) + ' GP，增幅点数获取 '+format(tmp.g.powerEff)+'x'+(tmp.nerdMode?" ((x+1)^"+format(tmp.g.powerExp)+")":"")},
					{}],
			"blank",
			["display-text",
				function() {return '你最多拥有 ' + formatWhole(player.g.best) + ' 生成器<br>你总共拥有 '+formatWhole(player.g.total)+" 生成器"},
					{}],
			"blank",
			"milestones", "blank", "blank", "upgrades"],
		increaseUnlockOrder: ["b"],
		milestones: {
			0: {
				requirementDescription: "8 生成器",
				done() { return player.g.best.gte(1) || hasAchievement("a", 41) || hasAchievement("a", 71) },
				effectDescription: "重置时保留声望升级。",
			},
			1: {
				requirementDescription: "10 生成器",
				done() { return player.g.best.gte(3) || hasAchievement("a", 71) },
				effectDescription: "每秒获得重置时能获得的 100% 的声望。",
			},
			2: {
				requirementDescription: "15 生成器",
				done() { return player.g.best.gte(4) || hasAchievement("a", 71) },
				effectDescription: "允许最大购买生成器。",
			},
		},
		upgrades: {
			rows: 3,
			cols: 5,
			11: {
				title: "GP 连击",
				description: "最多生成器加成声望获取。",
				cost() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?380:3) },
				effect() { return player.g.best.sqrt().plus(1).pow(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?5e5:1) },
				unlocked() { return player.g.unlocked },
				effectDisplay() { return format(tmp.g.upgrades[11].effect)+"x" },
				formula() { return ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?"(x+1)^250,000":"sqrt(x)+1" },
			},
			12: {
				title: "给我更多！",
				description: "增幅器加成生成器底数。",
				cost() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?375:7) },
				effect() { 
					let ret = player.b.points.add(1).log10().sqrt().div(3).times(hasUpgrade("e", 14)?upgradeEffect("e", 14):1);
					if (hasUpgrade("s", 24)) ret = ret.times(upgradeEffect("s", 24));
					return ret;
				},
				unlocked() { return player.b.unlocked&&player.g.unlocked },
				effectDisplay() { return "+"+format(tmp.g.upgrades[12].effect) },
				formula() { 
					let m = new Decimal(hasUpgrade("e", 14)?upgradeEffect("e", 14):1).div(3)
					if (hasUpgrade("s", 24)) m = upgradeEffect("s", 24).times(m);
					return "sqrt(log(x+1))"+(m.eq(1)?"":(m.gt(1)?("*"+format(m)):("/"+format(m.pow(-1)))));
				},
			},
			13: {
				title: "给我更多 II",
				description: "最多声望加成生成器底数。",
				cost() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?381:8) },
				effect() { 
					let ret = player.p.best.add(1).log10().add(1).log10().div(3).times(hasUpgrade("e", 14)?upgradeEffect("e", 14):1);
					if (hasUpgrade("s", 24)) ret = ret.times(upgradeEffect("s", 24));
					return ret;
				},
				unlocked() { return player.g.best.gte(8) },
				effectDisplay() { return "+"+format(tmp.g.upgrades[13].effect) },
				formula() { 
					let m = new Decimal(hasUpgrade("e", 14)?upgradeEffect("e", 14):1).div(3)
					if (hasUpgrade("s", 24)) m = upgradeEffect("s", 24).times(m);
					return "log(log(x+1)+1)"+(m.eq(1)?"":(m.gt(1)?("*"+format(m)):("/"+format(m.pow(-1)))));
				},
			},
			14: {
				title: "增益增益",
				description() { return "<b>声望增益</b> 的效果提升至 1.5 次幂。" },
				cost() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?378:13) },
				unlocked() { return player.g.best.gte(10) },
			},
			15: {
				title: "外部协同",
				description: "生成器加成 <b>自协同</b> 效果。",
				cost() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?382:15) },
				effect() { 
					let eff = player.g.points.sqrt().add(1);
					if (eff.gte(400)) eff = eff.cbrt().times(Math.pow(400, 2/3))
					return eff;
				},
				unlocked() { return hasUpgrade("g", 13) },
				effectDisplay() { return "^"+format(tmp.g.upgrades[15].effect) },
				formula() { return upgradeEffect("g", 15).gte(400)?"((x+1)^(1/6))*(400^(2/3))":"sqrt(x)+1" },
			},
			21: {
				title: "给我更多 III",
				description: "GP 加成 GP 获取。",
				cost() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?"1e314":1e10) },
				currencyDisplayName: "GP",
                currencyInternalName: "power",
                currencyLayer: "g",
				effect() { 
					let ret = player.g.power.add(1).log10().add(1);
					if (hasUpgrade("s", 24)) ret = ret.pow(upgradeEffect("s", 24));
					if ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false) ret = ret.pow(1e4)
					return ret;
				},
				unlocked() { return hasUpgrade("g", 15) },
				effectDisplay() { return format(tmp.g.upgrades[21].effect)+"x" },
				formula() { 
					let exp = new Decimal(1);
					if (hasUpgrade("s", 24)) exp = exp.times(upgradeEffect("s", 24));
					if ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false) exp = exp.times(1e4);
					let f = "log(x+1)+1";
					if (exp.gt(1)) f = "("+f+")^"+format(exp);
					return f;
				},
			},
			22: {
				title: "两折",
				description: "声望降低生成器价格。",
				cost() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?"5e47141":1e11) },
				currencyDisplayName: "GP",
                currencyInternalName: "power",
                currencyLayer: "g",
				effect() { 
					let eff = player.p.points.add(1).pow(0.25);
					if (hasUpgrade("g", 32) && player.i.buyables[12].gte(2)) eff = eff.pow(upgradeEffect("g", 32));
					return eff;
				},
				unlocked() { return hasUpgrade("g", 15) },
				effectDisplay() { return "/"+format(tmp.g.upgrades[22].effect) },
				formula: "(x+1)^0.25",
			},
			23: {
				title: "双重反转",
				description: "增幅器加成 <b>反转声望增益</b> 效果。",
				cost() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?"2e47525":1e12) },
				currencyDisplayName: "GP",
                currencyInternalName: "power",
                currencyLayer: "g",
				effect() { return player.b.points.pow(0.85).add(1) },
				unlocked() { return hasUpgrade("g", 15)&&player.b.unlocked },
				effectDisplay() { return "^"+format(tmp.g.upgrades[23].effect) },
				formula: "x^0.85+1",
			},
			24: {
				title: "再次增益增益",
				description: "<b>声望增益</b> 的效果提升至 1.467 次幂。",
				cost() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?690:20) },
				unlocked() { return hasUpgrade("g", 14)&&(hasUpgrade("g", 21)||hasUpgrade("g", 22)) },
			},
			25: {
				title: "给我更多 IV",
				description: "声望加成 GP 获取。",
				cost() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?"1e47526":1e14) },
				currencyDisplayName: "GP",
                currencyInternalName: "power",
                currencyLayer: "g",
				effect() { 
					let ret = player.p.points.add(1).log10().pow(3).add(1);
					if (hasUpgrade("s", 24)) ret = ret.pow(upgradeEffect("s", 24));
					return ret;
				},
				unlocked() { return hasUpgrade("g", 23)&&hasUpgrade("g", 24) },
				effectDisplay() { return format(tmp.g.upgrades[25].effect)+"x" },
				formula() { 
					let f = "log(x+1)^3+1";
					if (hasUpgrade("s", 24)) f = "("+f+")^"+format(upgradeEffect("s", 24));
					return f;
				},
			},
			31: {
				title: "荒诞生成器",
				description: "GP 加成超级生成器底数。",
				cost() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?"1e47545":"e4.4e7") },
				currencyDisplayName: "GP",
                currencyInternalName: "power",
                currencyLayer: "g",
				pseudoUnl() { return player.i.buyables[12].gte(2)&&player.g.upgrades.length>=10 },
				pseudoReq: "需要: 无 GP 达到 e73,600,000 声望（使用增强重置）。",
				pseudoCan() { return player.p.points.gte("e7.35e7") && player.g.power.eq(0) },
				unlocked() { return player[this.layer].pseudoUpgs.includes(Number(this.id)) },
				effect() { return player.g.power.plus(1).log10().plus(1).pow(2) },
				effectDisplay() { return format(tmp[this.layer].upgrades[this.id].effect)+"x" },
				formula: "(log(x+1)+1)^2",
			},
			32: {
				title: "原始本能",
				description: "<b>第四建筑</b> 加成 <b>二折</b>。",
				cost() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?1260:2200) },
				pseudoUnl() { return player.i.buyables[12].gte(2)&&player.g.upgrades.length>=10 },
				pseudoReq: "需要: 无增幅器达到 e47,500,000 GP（使用增强重置)",
				pseudoCan() { return player.g.power.gte("e4.75e7") && player.b.best.eq(0) },
				unlocked() { return player[this.layer].pseudoUpgs.includes(Number(this.id)) },
				effect() { return buyableEffect("s", 14).pow(0.8) },
				effectDisplay() { return "^"+format(tmp[this.layer].upgrades[this.id].effect) },
				formula: "eff^0.8",
				style: {"font-size": "9px"},
			},
			33: {
				title: "星尘生产",
				description: "生成器加成星尘获取。",
				cost() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?"1e48000":"e5.6e7") },
				currencyDisplayName: "GP",
                currencyInternalName: "power",
                currencyLayer: "g",
				pseudoUnl() { return player.i.buyables[12].gte(2)&&player.g.upgrades.length>=10 },
				pseudoReq: "需要: 1e14 星云",
				pseudoCan() { return player.n.points.gte(1e14) },
				unlocked() { return player[this.layer].pseudoUpgs.includes(Number(this.id)) },
				effect() { return Decimal.pow(1.15, player.g.points.sqrt()) },
				effectDisplay() { return format(tmp[this.layer].upgrades[this.id].effect)+"x" },
				formula: "1.15^sqrt(x)",
			},
			34: {
				title: "增益增益^2",
				description: "<b>声望增益</b> 的效果提升至 1.433 次幂",
				cost() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?1257:2200) },
				pseudoUnl() { return player.i.buyables[12].gte(2)&&player.g.upgrades.length>=10 },
				pseudoReq: "需要: 36 成就。",
				pseudoCan() { return player.a.achievements.length>=36 },
				unlocked() { return player[this.layer].pseudoUpgs.includes(Number(this.id)) },
			},
			35: {
				title: "进入未来",
				description: "GP 加成星云、荣耀、超空间能量获取。",
				cost() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?"1e47540":"e4.4e7") },
				currencyDisplayName: "GP",
                currencyInternalName: "power",
                currencyLayer: "g",
				pseudoUnl() { return player.i.buyables[12].gte(2)&&player.g.upgrades.length>=10 },
				pseudoReq: "需要: 5e18 荣耀 & 5e17 超空间能量。",
				pseudoCan() { return player.hn.points.gte(5e18) && player.hs.points.gte(5e17) },
				unlocked() { return player[this.layer].pseudoUpgs.includes(Number(this.id)) },
				effect() { return player.g.power.plus(1).log10().plus(1).sqrt() },
				effectDisplay() { return format(tmp[this.layer].upgrades[this.id].effect)+"x" },
				formula: "sqrt(log(x+1)+1)",
			},
		},
})
/*
                       
                       
         tttt          
      ttt:::t          
      t:::::t          
      t:::::t          
ttttttt:::::ttttttt    
t:::::::::::::::::t    
t:::::::::::::::::t    
tttttt:::::::tttttt    
      t:::::t          
      t:::::t          
      t:::::t          
      t:::::t    tttttt
      t::::::tttt:::::t
      tt::::::::::::::t
        tt:::::::::::tt
          ttttttttttt  
                       
                       
                       
                       
                       
                       
                       
*/
addLayer("t", {
        name: "time", // This is optional, only used in a few places, If absent it just uses the layer id.
        symbol: "NaN", // This appears on the layer's node. Default is the id with the first letter capitalized
        position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
        startData() { return {
            unlocked: false,
			points: new Decimal(0),
			best: new Decimal(0),
			energy: new Decimal(0),
			first: 0,
			auto: false,
			pseudoUpgs: [],
			autoExt: false,
        }},
        color: "#92ffd5",
        requires() { return new Decimal(1e120).times(Decimal.pow("1e180", Decimal.pow(player[this.layer].unlockOrder, 1.415038))) }, // Can be a function that takes requirement increases into account
        resource: "时间速效胶囊", // Name of prestige currency
        baseResource: "DECOMBER", // Name of resource prestige is based on
        baseAmount() {return player.points}, // Get the current amount of baseResource
        type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
        exponent() { return ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?new Decimal(1.4):new Decimal(1.85) }, // Prestige currency exponent
		base() { return ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?new Decimal(10):new Decimal(1e15) },
        gainMult() { // Calculate the multiplier for main currency from bonuses
            mult = new Decimal(1)
            return mult
        },
        gainExp() { // Calculate the exponent on main currency from bonuses
            return new Decimal(1)
        },
		canBuyMax() { return hasMilestone("q", 1) },
		enCapMult() {
			let mult = new Decimal(1);
			if (hasUpgrade("t", 12)) mult = mult.times(upgradeEffect("t", 12));
			if (hasUpgrade("t", 21)) mult = mult.times(100);
			if (hasUpgrade("t", 22)) mult = mult.times(upgradeEffect("t", 22));
			if (player.h.unlocked) mult = mult.times(tmp.h.effect);
			if (player.o.unlocked) mult = mult.times(tmp.o.solEnEff2);
			return mult;
		},
		enGainMult() {
			let mult = new Decimal(1);
			if (hasUpgrade("t", 22)) mult = mult.times(upgradeEffect("t", 22));
			if (player.h.unlocked) mult = mult.times(tmp.h.effect);
			return mult;
		},
		effBaseMult() {
			let mult = new Decimal(1);
			if (player.o.unlocked) mult = mult.times(buyableEffect("o", 13));
			if (player.ba.unlocked) mult = mult.times(tmp.ba.posBuff);
			if (player.m.unlocked) mult = mult.times(tmp.m.buyables[12].effect);
			return mult;
		},
		effBasePow() {
			let exp = new Decimal(1);
			if (player.m.unlocked) exp = exp.times(player.m.spellTimes[12].gt(0)?1.1:1);
			return exp;
		},
		effGainBaseMult() {
			let mult = new Decimal(1);
			if (player.ps.unlocked) mult = mult.times(challengeEffect("h", 32));
			if (((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false) && hasUpgrade("t", 11)) mult = mult.times(upgradeEffect("t", 11).max(1));
			if (((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false) && hasUpgrade("t", 25)) mult = mult.times(upgradeEffect("t", 25).max(1))
			return mult;
		},
		effLimBaseMult() {
			let mult = tmp.n.realDustEffs2?new Decimal(tmp.n.realDustEffs2.orangePurple||1):new Decimal(1);
			if (hasUpgrade("t", 33) && player.i.buyables[12].gte(4)) mult = mult.times(upgradeEffect("t", 33));
			return mult;
		},
		nonExtraTCPow() {
			let pow = new Decimal(1);
			if (player.en.unlocked) pow = pow.times(tmp.en.twEff);
			return pow;
		},
		effect() { 
			if (!unl(this.layer)) return {gain: new Decimal(0), limit: new Decimal(0)};
			else return {
				gain: Decimal.pow(tmp.t.effBaseMult.times(tmp.t.effGainBaseMult).times(3).pow(tmp.t.effBasePow), player.t.points.times(tmp.t.nonExtraTCPow).plus(player.t.buyables[11]).plus(tmp.t.freeExtraTimeCapsules)).sub(1).max(0).times(player.t.points.times(tmp.t.nonExtraTCPow).plus(player.t.buyables[11]).gt(0)?1:0).times(tmp.t.enGainMult).max(0),
				limit: Decimal.pow(tmp.t.effBaseMult.times(tmp.t.effLimBaseMult).times(2).pow(tmp.t.effBasePow), player.t.points.times(tmp.t.nonExtraTCPow).plus(player.t.buyables[11]).plus(tmp.t.freeExtraTimeCapsules)).sub(1).max(0).times(100).times(player.t.points.times(tmp.t.nonExtraTCPow).plus(player.t.buyables[11]).gt(0)?1:0).times(tmp.t.enCapMult).max(0),
			}
		},
		effect2() {
			if (!((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false) || !unl(this.layer)) return new Decimal(1);
			let c = player.t.points.plus(player.t.buyables[11]).plus(tmp.t.freeExtraTimeCapsules);
			return Decimal.pow(1.01, c.sqrt());
		},
		effectDescription() {
			return "生成 "+format(tmp.t.effect.gain)+" TE/sec，同时上限为  "+format(tmp.t.effect.limit)+" TE"+(tmp.nerdMode?("\n(每个获得 "+format(tmp.t.effBaseMult.times(tmp.t.effGainBaseMult).times(3))+"x，每个上限 "+format(tmp.t.effBaseMult.times(2))+"x)"):"")+(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?("，并使 掌握 前的所有层的速度加成 "+format(tmp.t.effect2)+(tmp.nerdMode?(" (1.01^sqrt(x))"):"")):"")
		},
		enEff() {
			if (!unl(this.layer)) return new Decimal(1);
			let eff = player.t.energy.add(1).pow(1.2);
			if (hasUpgrade("t", 14)) eff = eff.pow(1.3);
			if (hasUpgrade("q", 24)) eff = eff.pow(7.5);
			return softcap("timeEnEff", eff);
		},
		enEff2() {
			if (!unl(this.layer)) return new Decimal(0);
			if (!hasUpgrade("t", 24)) return new Decimal(0);
			let exp = 5/9
			if (hasUpgrade("t", 35) && player.i.buyables[12].gte(4)) exp = .565;
			let eff = player.t.energy.max(0).plus(1).log10().pow(exp);
			return softcap("timeEnEff2", eff).floor();
		},
		nextEnEff2() {
			if (!hasUpgrade("t", 24)) return new Decimal(1/0);
			let next = Decimal.pow(10, reverse_softcap("timeEnEff2", tmp.t.enEff2.plus(1)).pow(1.8)).sub(1);
			return next;
		},
		autoPrestige() { return (player.t.auto && hasMilestone("q", 3))&&player.ma.current!="t" },
		update(diff) {
			if (player.t.unlocked) player.t.energy = player.t.energy.plus(this.effect().gain.times(diff)).min(this.effect().limit).max(0);
			if (player.t.autoExt && hasMilestone("q", 1) && !inChallenge("h", 31)) this.buyables[11].buyMax();
		},
        row: 2, // Row the layer is in on the tree (0 is the first row)
        hotkeys: [
            {key: "t", description: "按 T 进行时间重置", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
        ],
		resetsNothing() { return hasMilestone("q", 5)&&player.ma.current!="t" },
		tabFormat: ["main-display",
			"prestige-button",
			"blank",
			["display-text",
				function() {return '你有 ' + format(player.t.energy) + ' TE，增幅点数和声望获取 '+format(tmp.t.enEff)+'x'+(tmp.nerdMode?" ((x+1)^"+format(1.2*(hasUpgrade("t", 14)?1.3:1)*(hasUpgrade("q", 24)?7.5:1))+")":"")+(hasUpgrade("t", 24)?("，并提供 "+formatWhole(tmp.t.enEff2)+" 个免费的扩展时间胶囊 ("+(tmp.nerdMode?"log(x+1)^3":("下一个在 "+format(tmp.t.nextEnEff2)))+")."):"")},
					{}],
			"blank",
			["display-text",
				function() {return '你最多拥有 ' + formatWhole(player.t.best) + ' TE'},
					{}],
			"blank",
			"milestones", "blank", "buyables", "blank", "upgrades"],
        increaseUnlockOrder: ["e", "s"],
        doReset(resettingLayer){ 
			let keep = [];
			if (hasMilestone("q", 0)) keep.push("milestones")
			if (hasMilestone("q", 2) || hasAchievement("a", 64)) keep.push("upgrades")
            if (layers[resettingLayer].row > this.row) layerDataReset(this.layer, keep)
        },
        layerShown(){return player.b.unlocked},
        branches: ["b"],
		upgrades: {
			rows: 4,
			cols: 5,
			11: {
				title: "伪增幅",
				description: "非扩展时空胶囊加成增幅器底数。",
				cost() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?750:2) },
				unlocked() { return player.t.unlocked },
				effect() { 
					return player.t.points.pow(0.9).add(0.5).plus(hasUpgrade("t", 13)?upgradeEffect("t", 13):0).pow(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?3:1);
				},
				effectDisplay() { return "+"+format(tmp.t.upgrades[11].effect) },
				formula() { 
					let f = "x^0.9"+(hasUpgrade("t", 13)?("+"+format(upgradeEffect("t", 13).plus(0.5))):"+0.5") 
					if ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false) f = "("+f+")^3"
					return f;
				},
			},
			12: {
				title: "超越极限",
				description: "增幅器加成 TE 上限，并获取 1 个扩展时空胶囊。",
				cost() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?1e262:([5e4,2e5,2.5e6][player[this.layer].unlockOrder||0])) },
				currencyDisplayName: "TE",
                currencyInternalName: "energy",
                currencyLayer: "t",
				unlocked() { return player.t.best.gte(2) },
				effect() { 
					return player.b.points.pow(0.95).add(1)
				},
				effectDisplay() { return format(tmp.t.upgrades[12].effect)+"x" },
				formula: "x^0.95+1",
			},
			13: {
				title: "伪伪增幅",
				description: "扩展时空胶囊同样计入 <b>伪增幅</b> 的效果。",
				cost() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?1e265:([3e6,3e7,3e8][player[this.layer].unlockOrder||0])) },
				currencyDisplayName: "TE",
                currencyInternalName: "energy",
                currencyLayer: "t",
				unlocked() { return hasUpgrade("t", 12) },
				effect() { 
					return player.t.buyables[11].add(tmp.t.freeExtraTimeCapsules).pow(0.95);
				},
				effectDisplay() { return "+"+format(tmp.t.upgrades[13].effect) },
				formula: "x^0.95",
			},
			14: {
				title: "更多时间",
				description: "TE 效果提高到 1.3 次幂。",
				cost() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?760:(player.t.unlockOrder>=2?5:4)) },
				unlocked() { return hasUpgrade("t", 13) },
			},
			15: {
				title: "时间效力",
				description: "TE 加成 GP 获取。",
				cost() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?1e267:([1.25e7,(player.s.unlocked?3e8:6e7),1.5e9][player[this.layer].unlockOrder||0])) },
				currencyDisplayName: "TE",
                currencyInternalName: "energy",
                currencyLayer: "t",
				unlocked() { return hasUpgrade("t", 13) },
			},
			21: {
				title: "虚弱链",
				description: "TE 上限扩大 100 倍。",
				cost() { return ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?759:12 },
				unlocked() { return hasAchievement("a", 33) },
			},
			22: {
				title: "增强时间",
				description: "增强 加成 TE 获取和上限。",
				cost() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?765:9) },
				unlocked() { return hasAchievement("a", 33) },
				effect() { 
					return player.e.points.plus(1).root(10).pow(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?1.1:1);
				},
				effectDisplay() { return format(tmp.t.upgrades[22].effect)+"x" },
				formula() { return "(x+1)^"+(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?"0.11":"0.1") },
			},
			23: {
				title: "反转时间",
				description: "时间以你首先选择时间的方式运行。",
				cost() { return new Decimal(player[this.layer].unlockOrder>=2?3e9:(player.s.unlocked?6.5e8:1.35e8)) },
				currencyDisplayName: "TE",
				currencyInternalName: "energy",
				currencyLayer: "t",
				unlocked() { return (player[this.layer].unlockOrder>0||hasUpgrade("t", 23))&&hasUpgrade("t", 13) },
				onPurchase() { player[this.layer].unlockOrder = 0; },
			},
			24: {
				title: "时间膨胀",
				description: "解锁一个新的 TE 效果。",
				cost() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?1e267:2e17) },
				currencyDisplayName: "TE",
				currencyInternalName: "energy",
				currencyLayer: "t",
				unlocked() { return hasAchievement("a", 33) },
			},
			25: {
				title: "底数",
				description: "TE 加成增幅器底数。",
				cost() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?'1e9000':3e19) },
				currencyDisplayName: "TE",
				currencyInternalName: "energy",
				currencyLayer: "t",
				unlocked() { return hasAchievement("a", 33) },
				effect() { return player.t.energy.plus(1).log10().div(1.2).pow(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?3:1) },
				effectDisplay() { return "+"+format(tmp.t.upgrades[25].effect) },
				formula() { return ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?"(log(x+1)/1.2)^3":"log(x+1)/1.2" },
			},
			31: {
				title: "廉价时间",
				description: "扩展时间胶囊价格不再缩放，价格指数降低 0.2。",
				cost() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?"1e16400":"e3600000") },
				currencyDisplayName: "TE",
				currencyInternalName: "energy",
				currencyLayer: "t",
				pseudoUnl() { return player.i.buyables[12].gte(4)&&player.t.upgrades.length>=9 },
				pseudoReq: "需要: 1e42 荣耀",
				pseudoCan() { return player.hn.points.gte(1e42) },
				unlocked() { return player[this.layer].pseudoUpgs.includes(Number(this.id)) },
			},
			32: {
				title: "超时间连续体",
				description: "超空间价格缩放减缓 33.33%。",
				cost() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?"1e39000":"e4240000") },
				currencyDisplayName: "TE",
				currencyInternalName: "energy",
				currencyLayer: "t",
				pseudoUnl() { return player.i.buyables[12].gte(4)&&player.t.upgrades.length>=9 },
				pseudoReq: "需要: 1e31 超空间能量",
				pseudoCan() { return player.hs.points.gte(1e31) },
				unlocked() { return player[this.layer].pseudoUpgs.includes(Number(this.id)) },
			},
			33: {
				title: "近似无限",
				description: "TE 加成 TE 上限底数。",
				cost() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?759:750) },
				pseudoUnl() { return player.i.buyables[12].gte(4)&&player.t.upgrades.length>=9 },
				pseudoReq: "需要: 30 幽魂",
				pseudoCan() { return player.ps.points.gte(30) },
				unlocked() { return player[this.layer].pseudoUpgs.includes(Number(this.id)) },
				effect() { return player.t.energy.plus(1).log10().plus(1).pow(3.5) },
				effectDisplay() { return format(tmp.t.upgrades[33].effect)+"x" },
				formula: "(log(x+1)+1)^3.5",
			},
			34: {
				title: "缩放盛宴",
				description: "1225 之后的增幅器和生成器缩放改为从 1400 开始。",
				cost() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?"1e39000":"e4240000") },
				currencyDisplayName: "TE",
				currencyInternalName: "energy",
				currencyLayer: "t",
				pseudoUnl() { return player.i.buyables[12].gte(4)&&player.t.upgrades.length>=9 },
				pseudoReq: '需要: 在 "减产" 障碍中以无超空间建筑达到 e124,000,000 声望。',
				pseudoCan() { return player.p.points.gte("e1.24e8") && inChallenge("h", 42) && player.hs.spentHS.eq(0) },
				unlocked() { return player[this.layer].pseudoUpgs.includes(Number(this.id)) },
			},
			35: {
				title: "珍惜时间",
				description: "TE 的第二个效果的指数提高（0.556 -> 0.565)。",
				cost() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?"1e38000":"e3600000") },
				currencyDisplayName: "TE",
				currencyInternalName: "energy",
				currencyLayer: "t",
				pseudoUnl() { return player.i.buyables[12].gte(4)&&player.t.upgrades.length>=9 },
				pseudoReq: "需要: 1e13 紫尘",
				pseudoCan() { return player.n.purpleDust.gte(1e13) },
				unlocked() { return player[this.layer].pseudoUpgs.includes(Number(this.id)) },
			},
			41: {
				title: "亚时态之幂",
				description: "将子空间底数提高至 1.5 次幂，同时增加超空间能量获取 2,500x。",
				cost: new Decimal(1050),
				pseudoUnl() { return player.i.buyables[12].gte(4)&&player.t.upgrades.length>=9 },
				pseudoReq: "需要: 1e60 荣耀 & 1e575 魂力",
				pseudoCan() { return player.hn.points.gte(1e60) && player.ps.power.gte("1e575") },
				unlocked() { return player[this.layer].pseudoUpgs.includes(Number(this.id)) },
			},
		},
		freeExtraTimeCapsules() {
			let free = new Decimal(0);
			if (hasUpgrade("t", 12)) free = free.plus(1);
			if (hasUpgrade("t", 24)) free = free.plus(tmp.t.enEff2);
			if (hasUpgrade("q", 22)) free = free.plus(upgradeEffect("q", 22));
			return free;
		},
		buyables: {
			rows: 1,
			cols: 1,
			11: {
				title: "服用胶囊",
				costScalingEnabled() {
					return !(hasUpgrade("t", 31) && player.i.buyables[12].gte(4))
				},
				costExp() {
					let exp = new Decimal(1.2);
					if (hasUpgrade("t", 31) && player.i.buyables[12].gte(4)) exp = exp.sub(.2);
					return exp;
				},
				cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                    if (x.gte(25) && tmp[this.layer].buyables[this.id].costScalingEnabled) x = x.pow(2).div(25)
                    let cost = x.times(0.4).pow(tmp[this.layer].buyables[this.id].costExp).add(1).times(10)
					if ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false) cost = cost.pow(.9);
                    return cost.floor()
                },
				display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
					let e = tmp.t.freeExtraTimeCapsules;
                    let display = (tmp.nerdMode?("价格公式: "+((player[this.layer].buyables[this.id].gte(25)&&data.costScalingEnabled)?"(((x^2)/25":"((x")+"*0.4)^"+format(data.costExp)+"+1)*10"):("价格: " + formatWhole(data.cost) + " 增幅器"))+"\n\
                    数量: " + formatWhole(player[this.layer].buyables[this.id])+(e.gt(0)?(" + "+formatWhole(e)):"")+(inChallenge("h", 31)?("\n剩余购买量的大脆倍数: "+String(10-player.h.chall31bought)):"")
					return display;
                },
                unlocked() { return player[this.layer].unlocked }, 
                canAfford() {
                    return player.b.points.gte(tmp[this.layer].buyables[this.id].cost) && (inChallenge("h", 31) ? player.h.chall31bought<10 : true)},
                buy() { 
                    cost = tmp[this.layer].buyables[this.id].cost
                    player.b.points = player.b.points.sub(cost)	
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
					if (inChallenge("h", 31)) player.h.chall31bought++;
                },
                buyMax() {
					if (!this.canAfford()) return;
					if (inChallenge("h", 31)) return;
					let b = player.b.points.plus(1);
					if ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false) b = b.root(.9);
					let tempBuy = b.div(10).sub(1).max(0).root(tmp[this.layer].buyables[this.id].costExp).div(0.4);
					if (tempBuy.gte(25) && tmp[this.layer].buyables[this.id].costScalingEnabled) tempBuy = tempBuy.times(25).sqrt();
					let target = tempBuy.plus(1).floor();
					player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].max(target);
				},
				autoed() { return player.t.autoExt && hasMilestone("q", 1) && !inChallenge("h", 31) },
                style: {'height':'222px'},
			},
		},
		milestones: {
			0: {
				requirementDescription: "2 时间胶囊",
				done() { return player.t.best.gte(2) || hasAchievement("a", 71) },
				effectDescription: "重置时保留 增幅器/生成器 里程碑。",
			},
			1: {
				requirementDescription: "3 时间胶囊",
				done() { return player.t.best.gte(3) || hasAchievement("a", 41) || hasAchievement("a", 71) },
				effectDescription: "重置时保留声望升级。",
			},
			2: {
				requirementDescription: "4 时间胶囊",
				done() { return player.t.best.gte(4) || hasAchievement("a", 71) },
				effectDescription: "对任何重置保留增幅器升级。",
			},
			3: {
				requirementDescription: "5 时间胶囊",
				done() { return player.t.best.gte(5) || hasAchievement("a", 71) },
				effectDescription: "解锁自动增幅器。",
				toggles: [["b", "auto"]],
			},
			4: {
				requirementDescription: "6 时间胶囊",
				done() { return player.t.best.gte(6) || hasAchievement("a", 71) },
				effectDescription: "增幅器不再重置任何东西。",
			},
		},
})
/*
                    
                    
                    
                    
                    
                    
    eeeeeeeeeeee    
  ee::::::::::::ee  
 e::::::eeeee:::::ee
e::::::e     e:::::e
e:::::::eeeee::::::e
e:::::::::::::::::e 
e::::::eeeeeeeeeee  
e:::::::e           
e::::::::e          
 e::::::::eeeeeeee  
  ee:::::::::::::e  
    eeeeeeeeeeeeee  
                    
                    
                    
                    
                    
                    
                    
*/
addLayer("e", {
        name: "enhance", // This is optional, only used in a few places, If absent it just uses the layer id.
        symbol: "E", // This appears on the layer's node. Default is the id with the first letter capitalized
        position: 2, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
        startData() { return {
            unlocked: false,
			points: new Decimal(0),
			best: new Decimal(0),
			total: new Decimal(0),
			first: 0,
			auto: false,
			pseudoUpgs: [],
        }},
        color: "#d25fa1",
        requires() { return new Decimal(1e120).times(Decimal.pow("1e180", Decimal.pow(player[this.layer].unlockOrder, 1.415038))) }, // Can be a function that takes requirement increases into account
        resource: "增强", // Name of prestige currency
        baseResource: "点数	", // Name of resource prestige is based on
        baseAmount() {return player.points}, // Get the current amount of baseResource
        type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
        exponent() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?.025:.02) }, // Prestige currency exponent
        gainMult() { // Calculate the multiplier for main currency from bonuses
            mult = new Decimal(1)
			if (hasUpgrade("e", 24)) mult = mult.times(upgradeEffect("e", 24));
            return mult
        },
        gainExp() { // Calculate the exponent on main currency from bonuses
            return new Decimal(1)
        },
		passiveGeneration() { return (hasMilestone("q", 1)&&player.ma.current!="e")?1:0 },
		update(diff) {
			if (player.e.auto && hasMilestone("q", 1) && !inChallenge("h", 31)) this.buyables[11].buyMax();
		},
        row: 2, // Row the layer is in on the tree (0 is the first row)
        hotkeys: [
            {key: "e", description: "按 E 进行增强重置。", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
        ],
        increaseUnlockOrder: ["t", "s"],
        doReset(resettingLayer){ 
			let keep = []
			if (hasMilestone("q", 2) || hasAchievement("a", 64)) keep.push("upgrades")
			if (layers[resettingLayer].row > this.row) layerDataReset(this.layer, keep)
        },
		freeEnh() {
			let enh = new Decimal(0);
			if (hasUpgrade("e", 13)) enh = enh.plus(1);
			if (hasUpgrade("e", 21)) enh = enh.plus(2);
			if (hasUpgrade("e", 23)) enh = enh.plus(upgradeEffect("e", 23));
			if (hasUpgrade("q", 22)) enh = enh.plus(upgradeEffect("q", 22));
			if (hasUpgrade("e", 32) && player.i.buyables[12].gte(3)) enh = enh.plus(upgradeEffect("e", 32));
			return enh;
		},
        layerShown(){return player.b.unlocked&&player.g.unlocked},
        branches: ["b","g"],
		upgrades: {
			rows: 4,
			cols: 4,
			11: {
				title: "第 2 列协同",
				description: "增幅器和生成器互相加成。",
				cost() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?"1e98000":((player.e.unlockOrder>=2)?25:100)) },
				unlocked() { return player.e.unlocked },
				effect() { 
					let exp = 1
					return {g: player.b.points.add(1).log10().pow(exp), b: player.g.points.add(1).log10().pow(exp)} 
				},
				effectDisplay() { return "生成器底数+"+format(tmp.e.upgrades[11].effect.g)+"，增幅器底数+"+format(tmp.e.upgrades[11].effect.b) },
				formula: "log(x+1)",
			},
			12: {
				title: "增强声望",
				description: "总共增强加成声望获取。",
				cost() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?"1e98000":(player.e.unlockOrder>=2?400:1e3)) },
				unlocked() { return hasUpgrade("e", 11) },
				effect() { 
					let ret = player.e.total.add(1).pow(1.5) 
					ret = softcap("e12", ret);
					if ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false) ret = ret.pow(1.5);
					return ret
				},
				effectDisplay() { return format(tmp.e.upgrades[12].effect)+"x" },
				formula() { 
					let f = upgradeEffect("e", 12).gte("1e1500")?"(x+1)^0.75*1e750":"(x+1)^1.5" 
					if ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false) f = "("+f+")^1.5"
					return f;
				},
			},
			13: {
				title: "增强 Plus",
				description: "获得一个免费的增强子。",
				cost() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?"e1e5":2.5e3) },
				unlocked() { return hasUpgrade("e", 11) },
			},
			14: {
				title: "更多添加物",
				description: "对于增幅器和生成器底数的任何增幅器和生成器升级效果 x4。",
				cost() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?"e1.01e5":3e23) },
				unlocked() { return hasAchievement("a", 33) },
				effect() {
					let e = new Decimal(4)
					if (hasUpgrade("b", 33)) e = e.times(upgradeEffect("b", 33))
					return e;
				},
				effectDisplay() { return format(tmp.e.upgrades[14].effect)+"x" },
				noFormula: true,
			},
			21: {
				title: "增强 Plus Plus",
				description: "获得两个免费的增强子。",
				cost() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?"e1.01e5":(player.e.unlockOrder>0?1e4:1e9)) },
				unlocked() { return hasUpgrade("e", 13) && ((!player.s.unlocked||(player.s.unlocked&&player.t.unlocked))&&player.t.unlocked) },
			},
			22: {
				title: "增强反转",
				description: "增强以你首先选择增强的方式运行。",
				cost() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?"e1.01e5":(player.e.unlockOrder>=2?1e3:3e4)) },
				unlocked() { return (player[this.layer].unlockOrder>0||hasUpgrade("e", 22))&&hasUpgrade("e", 12) },
				onPurchase() { player[this.layer].unlockOrder = 0; },
			},
			23: {
				title: "进入 E-空间",
				description: "空间能量提供免费增强子。",
				cost() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?"e1.01e5":2e20) },
				unlocked() { return hasAchievement("a", 33) },
				effect() {
					let eff = player.s.points.pow(2).div(25);
					if ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false) eff = eff.times(3.5);
					return eff.floor();
				},
				effectDisplay() { return "+"+formatWhole(tmp.e.upgrades[23].effect) },
				formula() { return "floor(x^2"+(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?"/7.14":"/25")+")" },
			},
			24: {
				title: "野兽般增长",
				description: "增幅器和生成器加成增强获取。",
				cost() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?"e1.011e5":2.5e28) },
				unlocked() { return hasAchievement("a", 33) },
				effect() { return Decimal.pow(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?"1e2000":1.1, player.b.points.plus(player.g.points).pow(0.9)) },
				effectDisplay() { return format(tmp.e.upgrades[24].effect)+"x" },
				formula() { return (((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?"1e2,000":"1.1")+"^((boosters+generators)^0.9)" },
			},
			31: {
				title: "放大",
				description: "增强子的第二个效果同样生效于超级增幅器、超级生成器和子空间底数。",
				cost() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?"e3450000":"e4125000") },
				pseudoUnl() { return player.i.buyables[12].gte(3)&&player.e.upgrades.length>=7 },
				pseudoReq: "需要: 无超级增幅器和超级生成器达到e2,464,000 增强（使用第四行重置）。",
				pseudoCan() { return player.sb.best.eq(0) && player.sg.best.eq(0) && player.e.points.gte("e2.464e6") },
				unlocked() { return player[this.layer].pseudoUpgs.includes(Number(this.id)) },
			},
			32: {
				title: "增援",
				description: "最多荣耀提供免费增强子。",
				cost() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?"e3460000":"e4500000") },
				pseudoUnl() { return player.i.buyables[12].gte(3)&&player.e.upgrades.length>=7 },
				pseudoReq: "需要: 30,300 免费增强子。",
				pseudoCan() { return tmp.e.freeEnh.gte(30300) },
				unlocked() { return player[this.layer].pseudoUpgs.includes(Number(this.id)) },
				effect() { return softcap("e32", player.hn.best.plus(1).log10().pow(3.25)).floor() },
				effectDisplay() { return "+"+format(tmp[this.layer].upgrades[this.id].effect) },
				formula: "log(x+1)^3.25",
			},
			33: {
				title: "扩增",
				description: "增强子的两个效果指数提高 20%。",
				cost() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?"e3460000":"e4500000") },
				pseudoUnl() { return player.i.buyables[12].gte(3)&&player.e.upgrades.length>=7 },
				pseudoReq: "需要: 60,600 购买的增强子。",
				pseudoCan() { return player.e.buyables[11].gte(60600) },
				unlocked() { return player[this.layer].pseudoUpgs.includes(Number(this.id)) },
			},
			34: {
				title: "强化",
				description: "增强子价格不再缩放。",
				cost() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?"e3450000":"e4125000") },
				pseudoUnl() { return player.i.buyables[12].gte(3)&&player.e.upgrades.length>=7 },
				pseudoReq: "需要: 无诡异层达到 e3,050,000 增强（使用第五行升级）。",
				pseudoCan() { return player.e.points.gte("e3.05e6") && player.q.buyables[11].eq(0) },
				unlocked() { return player[this.layer].pseudoUpgs.includes(Number(this.id)) },
			},
			41: {
				title: "进阶",
				description: "增强加成超空间能量获取。",
				cost() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?"e3460000":"e5750000") },
				pseudoUnl() { return player.i.buyables[12].gte(3)&&player.e.upgrades.length>=7 },
				pseudoReq: "需要: 无超空间建筑达到 44,900 购买增强子。",
				pseudoCan() { return player.e.buyables[11].gte(44900) && player.hs.spentHS.eq(0) },
				unlocked() { return player[this.layer].pseudoUpgs.includes(Number(this.id)) },
				effect() { return player.e.points.plus(1).log10().plus(1).pow(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?.45:.15) },
				effectDisplay() { return format(tmp[this.layer].upgrades[this.id].effect)+"x" },
				formula() { return "(log(x+1)+1)^"+(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?"0.45":"0.15") },
			},
		},
		buyables: {
			rows: 1,
			cols: 1,
			11: {
				title: "增强子",
				costScalingEnabled() {
					return !(hasUpgrade("e", 34) && player.i.buyables[12].gte(3));
				},
				cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                    if (x.gte(25) && tmp[this.layer].buyables[this.id].costScalingEnabled) x = x.pow(2).div(25)
                    let cost = Decimal.pow(2, x.pow(1.5))
                    return cost.floor()
                },
				power() {
					let pow = new Decimal(1);
					if (hasUpgrade("e", 33) && player.i.buyables[12].gte(3)) pow = pow.times(1.2);
					return pow;
				},
				effect(x=player[this.layer].buyables[this.id]) { // Effects of owning x of the items, x is a decimal
					let power = tmp[this.layer].buyables[this.id].power
					x = x.plus(tmp.e.freeEnh);
					if (!unl(this.layer)) x = new Decimal(0);
					
                    let eff = {}
                    if (x.gte(0)) eff.first = Decimal.pow(25, x.pow(power.times(1.1)))
                    else eff.first = Decimal.pow(1/25, x.times(-1).pow(power.times(1.1)))
					if (hasUpgrade("q", 24)) eff.first = eff.first.pow(7.5);
					eff.first = softcap("enh1", eff.first)
                
                    if (x.gte(0)) eff.second = x.pow(power.times(0.8))
                    else eff.second = x.times(-1).pow(power.times(0.8)).times(-1)
					if ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false) eff.second = eff.second.pow(50);
                    return eff;
                },
				display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    return (tmp.nerdMode?("价格公式: 2^("+((player[this.layer].buyables[this.id].gte(25)&&data.costScalingEnabled)?"((x^2)/25)":"x")+"^1.5)"):("价格: " + formatWhole(data.cost) + " 增强"))+"\n\
                    数量: " + formatWhole(player[this.layer].buyables[this.id])+(tmp.e.freeEnh.gt(0)?(" + "+formatWhole(tmp.e.freeEnh)):"") + "\n\
                   "+(tmp.nerdMode?(" 公式 1: 25^(x^"+format(data.power.times(1.1))+")\n\ 公式 2: x^"+format(data.power.times(0.8))):(" 增幅声望获取 " + format(data.effect.first) + "x 并提高增幅器和生成器的底数 " + format(data.effect.second)))+(inChallenge("h", 31)?("\n剩余购买量: "+String(10-player.h.chall31bought)):"")
                },
                unlocked() { return player[this.layer].unlocked }, 
                canAfford() {
                    return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost) && (inChallenge("h", 31) ? player.h.chall31bought<10 : true)},
                buy() { 
                    cost = tmp[this.layer].buyables[this.id].cost
                    player[this.layer].points = player[this.layer].points.sub(cost)	
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
					if (inChallenge("h", 31)) player.h.chall31bought++;
                },
                buyMax() {
					if (!this.canAfford()) return;
					if (inChallenge("h", 31)) return;
					let tempBuy = player[this.layer].points.max(1).log2().root(1.5)
					if (tempBuy.gte(25) && tmp[this.layer].buyables[this.id].costScalingEnabled) tempBuy = tempBuy.times(25).sqrt();
					let target = tempBuy.plus(1).floor();
					player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].max(target);
				},
				autoed() { return player.e.auto && hasMilestone("q", 1) && !inChallenge("h", 31) },
                style: {'height':'222px'},
			},
		},
		milestones: {
			0: {
				requirementDescription: "2 增强",
				done() { return player.e.best.gte(2) || hasAchievement("a", 71) },
				effectDescription: "重置时保留增幅器和生成器的里程碑。",
			},
			1: {
				requirementDescription: "5 增强",
				done() { return player.e.best.gte(5) || hasAchievement("a", 41) || hasAchievement("a", 71) },
				effectDescription: "重置时保留声望升级。",
			},
			2: {
				requirementDescription: "25 增强",
				done() { return player.e.best.gte(25) || hasAchievement("a", 71) },
				effectDescription: "重置时保留增幅器和生成器的升级。",
			},
		},
})
/*
                 
                 
                 
                 
                 
                 
    ssssssssss   
  ss::::::::::s  
ss:::::::::::::s 
s::::::ssss:::::s
 s:::::s  ssssss 
   s::::::s      
      s::::::s   
ssssss   s:::::s 
s:::::ssss::::::s
s::::::::::::::s 
 s:::::::::::ss  
  sssssssssss    
                 
                 
                 
                 
                 
                 
                 
*/
addLayer("s", {
        name: "space", // This is optional, only used in a few places, If absent it just uses the layer id.
        symbol: "S", // This appears on the layer's node. Default is the id with the first letter capitalized
        position: 3, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
        startData() { return {
            unlocked: false,
			points: new Decimal(0),
			best: new Decimal(0),
			spent: new Decimal(0),
			first: 0,
			auto: false,
			autoBld: false,
			pseudoUpgs: [],
        }},
        color: "#dfdfdf",
        requires() { return new Decimal(1e120).times(Decimal.pow("1e180", Decimal.pow(player[this.layer].unlockOrder, 1.415038))) }, // Can be a function that takes requirement increases into account
        resource: "空间能量", // Name of prestige currency
        baseResource: "点数", // Name of resource prestige is based on
        baseAmount() {return player.points}, // Get the current amount of baseResource
        type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
        exponent() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?1.4:1.85) }, // Prestige currency exponent
        base() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?10:(hasUpgrade("ss", 11)?1e10:1e15)) },
        gainMult() { // Calculate the multiplier for main currency from bonuses
            mult = new Decimal(1)
            return mult
        },
        gainExp() { // Calculate the exponent on main currency from bonuses
            return new Decimal(1)
        },
        row: 2, // Row the layer is in on the tree (0 is the first row)
        hotkeys: [
            {key: "s", description: "按 S 进行空间重置。", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
        ],
		resetsNothing() { return hasMilestone("q", 5)&&player.ma.current!="s" },
        increaseUnlockOrder: ["t", "e"],
        doReset(resettingLayer){ 
            let keep = []
			if (hasMilestone("q", 0)) keep.push("milestones")
			if (hasMilestone("q", 2) || hasAchievement("a", 64)) keep.push("upgrades")
			if (hasMilestone("q", 2) && (resettingLayer=="q"||resettingLayer=="h")) {
				keep.push("buyables");
				keep.push("spent");
			}
			if (layers[resettingLayer].row > this.row) layerDataReset(this.layer, keep)
        },
		space() {
			let space = player.s.best.pow(1.1).times(3);
			if (hasUpgrade("s", 13)) space = space.plus(2);
			if (hasAchievement("a", 53)) space = space.plus(2);
			if (player.ss.unlocked) space = space.plus(tmp.ss.eff1);
			
			if (inChallenge("h", 21)) space = space.div(10);
			return space.floor().sub(player.s.spent).max(0);
		},
		buildingBaseRoot() {
			let root = new Decimal(1);
			if (hasUpgrade("s", 34) && player.i.buyables[12].gte(5)) root = root.times(upgradeEffect("s", 34));
			return root;
		},
		buildingBaseCosts() { 
			let rt = tmp.s.buildingBaseRoot;
			return {
				11: new Decimal(1e3).root(rt),
				12: new Decimal(1e10).root(rt),
				13: new Decimal(1e25).root(rt),
				14: new Decimal(1e48).root(rt),
				15: new Decimal(1e250).root(rt),
				16: new Decimal("e3e7").root(rt),
				17: new Decimal("e4.5e7").root(rt),
				18: new Decimal("e6e7").root(rt),
				19: new Decimal("e3.5e8").root(rt),
				20: new Decimal("e1.5e9").root(rt),
		}},
		tabFormat: ["main-display",
			"prestige-button",
			"blank",
			["display-text",
				function() {return '你最多拥有 ' + formatWhole(player.s.best) + ' 空间能量'},
					{}],
			"blank",
			"milestones", "blank", 
			["display-text",
				function() {return '你有 ' + format(player.g.power) + ' GP'},
					{}],
			["display-text",
				function() {return '你的空间能量为你提供了 ' + formatWhole(tmp.s.space) + ' 空间'},
					{}],
			["display-text",
				function() {return tmp.s.buildingPower.eq(1)?"":("建筑增益: "+format(tmp.s.buildingPower.times(100))+"%")},
					{}],
			"blank",
			"buyables", "blank", "upgrades"],
        layerShown(){return player.g.unlocked},
        branches: ["g"],
		canBuyMax() { return hasMilestone("q", 1) },
		freeSpaceBuildings() {
			let x = new Decimal(0);
			if (hasUpgrade("s", 11)) x = x.plus(1);
			if (hasUpgrade("s", 22)) x = x.plus(upgradeEffect("s", 22));
			if (hasUpgrade("q", 22)) x = x.plus(upgradeEffect("q", 22));
			if (hasUpgrade("ss", 31)) x = x.plus(upgradeEffect("ss", 31));
			return x;
		},
		freeSpaceBuildings1to4() {
			let x = new Decimal(0);
			if (player.s.unlocked) x = x.plus(buyableEffect("s", 15));
			return x;
		},
		totalBuildingLevels() {
			let len = Object.keys(player.s.buyables).length
			if (len==0) return new Decimal(0);
			if (len==1) return Object.values(player.s.buyables)[0].plus(tmp.s.freeSpaceBuildings).plus(toNumber(Object.keys(player.s.buyables))<15?tmp.s.freeSpaceBuildings1to4:0)
			let l = Object.values(player.s.buyables).reduce((a,c,i) => Decimal.add(a, c).plus(toNumber(Object.keys(player.s.buyables)[i])<15?tmp.s.freeSpaceBuildings1to4:0)).plus(tmp.s.freeSpaceBuildings.times(len));
			return l;
		},
		manualBuildingLevels() {
			let len = Object.keys(player.s.buyables).length
			if (len==0) return new Decimal(0);
			if (len==1) return Object.values(player.s.buyables)[0]
			let l = Object.values(player.s.buyables).reduce((a,c) => Decimal.add(a, c));
			return l;
		},
		buildingPower() {
			if (!unl(this.layer)) return new Decimal(0);
			let pow = new Decimal(1);
			if (hasUpgrade("s", 21)) pow = pow.plus(0.08);
			if (hasChallenge("h", 21)) pow = pow.plus(challengeEffect("h", 21).div(100));
			if (player.ss.unlocked) pow = pow.plus(tmp.ss.eff2);
			if (hasUpgrade("ss", 42)) pow = pow.plus(1);
			if (hasUpgrade("ba", 12)) pow = pow.plus(upgradeEffect("ba", 12));
			if (player.n.buyables[11].gte(2)) pow = pow.plus(buyableEffect("o", 23));
			if (hasAchievement("a", 103)) pow = pow.plus(.1);
			if (inChallenge("h", 21)) pow = pow.sub(0.9);
			if (player.n.buyables[11].gte(5)) pow = pow.plus(buyableEffect("o", 33));
			
			if ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false) pow = pow.div(5);
			return pow;
		},
		autoPrestige() { return player.s.auto&&hasMilestone("q", 3)&&player.ma.current!="s" },
		update(diff) {
			if (player.s.autoBld && hasMilestone("q", 7)) for (let i=(5+player.i.buyables[11].toNumber());i>=1;i--) layers.s.buyables[10+i].buyMax();
		},
		upgrades: {
			rows: 3,
			cols: 5,
			11: {
				title: "Space X",
				description: "为所有建筑提供一个免费等级。",
				cost() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?758:2) },
				unlocked() { return player[this.layer].unlocked }
			},
			12: {
				title: "生成器生成器",
				description: "GP 加成 GP 生成。",
				cost() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?758:3) },
				unlocked() { return hasUpgrade("s", 11) },
				effect() { return player.g.power.add(1).log10().add(1) },
				effectDisplay() { return format(tmp.s.upgrades[12].effect)+"x" },
				formula: "log(x+1)+1",
			},
			13: {
				title: "运走",
				description: "建筑等级加成 GP 获取，你获得 2 个额外的空间。",
				cost() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?"1e48900":([1e37,1e59,1e94][player[this.layer].unlockOrder||0])) },
				currencyDisplayName: "GP",
                currencyInternalName: "power",
                currencyLayer: "g",
				unlocked() { return hasUpgrade("s", 11) },
				effect() { return softcap("s13", Decimal.pow(20, tmp.s.totalBuildingLevels)) },
				effectDisplay() { return format(tmp.s.upgrades[13].effect)+"x" },
				formula: "20^x",
			},
			14: {
				title: "进入重复",
				description: "解锁 <b>第四建筑</b>.",
				cost() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?759:4) },
				unlocked() { return hasUpgrade("s", 12)||hasUpgrade("s", 13) }
			},
			15: {
				title: "四边形",
				description: "<b>第四建筑</b> 成本开立方根，3x 增强，并增益 <b>BP 连击</b> （效果是 2.7 次方根）。",
				cost() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?"1e55000":([1e65,(player.e.unlocked?1e94:1e88),1e129][player[this.layer].unlockOrder||0])) },
				currencyDisplayName: "GP",
                currencyInternalName: "power",
                currencyLayer: "g",
				unlocked() { return hasUpgrade("s", 14) },
			},
			21: {
				title: "宽广",
				description: "所有建筑效果提高 8%。",
				cost() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?759:13) },
				unlocked() { return hasAchievement("a", 33) },
			},
			22: {
				title: "时空异常",
				description: "非扩展时空胶囊提供免费建筑。",
				cost() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?"1e55225":2.5e207) },
				currencyDisplayName: "GP",
				currencyInternalName: "power",
				currencyLayer: "g",
				unlocked() { return hasAchievement("a", 33) },
				effect() { return player.t.points.cbrt().floor() },
				effectDisplay() { return "+"+formatWhole(tmp.s.upgrades[22].effect) },
				formula: "floor(cbrt(x))",
			},
			23: {
				title: "反转空间",
				description() { return (player.e.unlocked&&player.t.unlocked&&(player.s.unlockOrder||0)==0)?"所有建筑价格除以 1e20。":("空间以你首先选择空间的方式运行"+(player.t.unlocked?"，并且所有建筑价格除以 1e20。":"。")) },
				cost() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?"1e55300":(player.s.unlockOrder>=2?1e141:(player.e.unlocked?1e105:1e95))) },
				currencyDisplayName: "GP",
                currencyInternalName: "power",
                currencyLayer: "g",
				unlocked() { return ((player.e.unlocked&&player.t.unlocked&&(player.s.unlockOrder||0)==0)||player[this.layer].unlockOrder>0||hasUpgrade("s", 23))&&hasUpgrade("s", 13) },
				onPurchase() { player[this.layer].unlockOrder = 0; },
			},
			24: {
				title: "想要更多？",
				description: "建筑总数加成四个 <b>给我更多</b> 效果。",
				cost() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?"1e55555":1e177) },
				currencyDisplayName: "GP",
				currencyInternalName: "power",
				currencyLayer: "g",
				unlocked() { return hasAchievement("a", 33) },
				effect() {
					return tmp.s.totalBuildingLevels.sqrt().div(5).plus(1);
				},
				effectDisplay() { return format(tmp.s.upgrades[24].effect.sub(1).times(100))+"% 加成" },
				formula: "sqrt(x)/5+1",
			},
			25: {
				title: "另一个？",
				description: "解锁 第五建筑",
				cost() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?"e8e5":1e244) },
				currencyDisplayName: "GP",
				currencyInternalName: "power",
				currencyLayer: "g",
				unlocked() { return hasAchievement("a", 33) },
			},
			31: {
				title: "有用维度",
				description: "前四个建筑的价格指数降低 0.04*(5-n)，n 是这个建筑的编号。",
				cost() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?815:1225) },
				pseudoUnl() { return player.i.buyables[12].gte(5)&&player.s.upgrades.length>=9 },
				pseudoReq: "需要: 1,200% 建筑增益",
				pseudoCan() { return tmp.s.buildingPower.gte(12) },
				unlocked() { return player[this.layer].pseudoUpgs.includes(Number(this.id)) },
				style: {"font-size": "9px"},
			},
			32: {
				title: "庞加莱循环",
				description: "每个建筑的购买等级加成至前一个建筑的额外等级。",
				cost() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?"e9e5":"e2.25e8") },
				currencyDisplayName: "GP",
				currencyInternalName: "power",
				currencyLayer: "g",
				pseudoUnl() { return player.i.buyables[12].gte(5)&&player.s.upgrades.length>=9 },
				pseudoReq: "需要: e1e9 点数",
				pseudoCan() { return player.points.gte("e1e9") },
				unlocked() { return player[this.layer].pseudoUpgs.includes(Number(this.id)) },
			},
			33: {
				title: "非连续谱",
				description: "<b>连续维度</b> 增幅星云和超空间能量获取。",
				cost() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?"e1e6":"e2.75e8") },
				currencyDisplayName: "GP",
				currencyInternalName: "power",
				currencyLayer: "g",
				pseudoUnl() { return player.i.buyables[12].gte(5)&&player.s.upgrades.length>=9 },
				pseudoReq: "需要: 至少 13 个空间升级，39 个成就，获得升级 <b>连续维度</b>。",
				pseudoCan() { return player.a.achievements.length>=39 && player.s.upgrades.length>=13 && hasUpgrade("s", 35) },
				unlocked() { return player[this.layer].pseudoUpgs.includes(Number(this.id)) },
				effect() { return upgradeEffect("s", 35).sqrt() },
				effectDisplay() { return format(upgradeEffect("s", 33))+"x" },
				formula: "sqrt(x)",
				style: {"font-size": "8px"},
			},
			34: {
				title: "能量还原",
				description: "空间能量降低前五个建筑的价格底数。",
				cost() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?"e9.01e5":"e1.95e8") },
				currencyDisplayName: "GP",
				currencyInternalName: "power",
				currencyLayer: "g",
				pseudoUnl() { return player.i.buyables[12].gte(5)&&player.s.upgrades.length>=9 },
				pseudoReq: "需要: 无购买建筑达到 e160,000,000 GP（使用建筑重置）。",
				pseudoCan() { return player.g.power.gte("e1.6e8") && tmp.s.manualBuildingLevels.eq(0) },
				unlocked() { return player[this.layer].pseudoUpgs.includes(Number(this.id)) },
				effect() { return player.s.points.plus(1).log10().plus(1).log10().plus(1) },
				effectDisplay() { return "开 "+format(tmp.s.upgrades[this.id].effect)+" 次根" },
				formula: "log(log(x+1)+1)+1",
				style: {"font-size": "9px"},
			},
			35: {
				title: "连续维度",
				description: "未使用的空间增幅荣耀获取。",
				cost() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?825:1255) },
				pseudoUnl() { return player.i.buyables[12].gte(5)&&player.s.upgrades.length>=9 },
				pseudoReq: "需要: 9e16 空间",
				pseudoCan() { return tmp.s.space.gte(9e16) },
				unlocked() { return player[this.layer].pseudoUpgs.includes(Number(this.id)) },
				effect() { return tmp.s.space.plus(1) },
				effectDisplay() { return format(tmp.s.upgrades[this.id].effect)+"x" },
				formula: "x+1",
			},
		},
		divBuildCosts() {
			let div = new Decimal(1);
			if (hasUpgrade("s", 23) && player.t.unlocked) div = div.times(1e20);
			if (player.ss.unlocked) div = div.times(tmp.ss.eff3);
			return div;
		},
		buildScalePower() {
			let scale = new Decimal(1);
			if (hasUpgrade("p", 42)) scale = scale.times(.5);
			if (hasUpgrade("hn", 42)) scale = scale.times(.8);
			if ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false) scale = scale.div(3.85);
			if (tmp.m.buyables[14].unlocked) scale = scale.times(Decimal.sub(1, tmp.m.buyables[14].effect));
			return scale;
		},
		buyables: {
			rows: 1,
			cols: 10,
			showRespec() { return player.s.unlocked },
            respec() { // Optional, reset things and give back your currency. Having this function makes a respec button appear
				player[this.layer].spent = new Decimal(0);
                resetBuyables(this.layer)
                doReset(this.layer, true) // Force a reset
            },
            respecText: "重置建筑", // Text on Respec button, optional
			11: {
				title: "第一建筑",
				costExp() { 
					let exp = 1.35;
					if (hasUpgrade("s", 31) && player.i.buyables[12].gte(5)) exp -= 0.04*(15-this.id);
					return exp;
				},
				cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
					let base = tmp.s.buildingBaseCosts[this.id];
					if (x.eq(0)) return new Decimal(0);
					return Decimal.pow(base, x.times(tmp.s.buildScalePower).pow(tmp[this.layer].buyables[this.id].costExp)).times(base).div(tmp.s.divBuildCosts);
                },
				freeLevels() {
					let levels = tmp.s.freeSpaceBuildings.plus(tmp.s.freeSpaceBuildings1to4);
					if (hasUpgrade("s", 32) && player.i.buyables[12].gte(5)) levels = levels.plus(player.s.buyables[11+1]||0);
					return levels;
				},
				effect(x=player[this.layer].buyables[this.id]) { // Effects of owning x of the items, x is a decimal
					let eff = Decimal.pow(x.plus(1).plus(tmp.s.freeSpaceBuildings).times(tmp.s.buildingPower), player.s.points.sqrt()).times(x.plus(tmp.s.buyables[this.id].freeLevels).times(tmp.s.buildingPower).max(1).times(4)).max(1);
					if (player.hs.unlocked) eff = eff.pow(buyableEffect("hs", 21));
					return eff;
                },
				display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    return (tmp.nerdMode?("价格公式: "+format(tmp.s.buildingBaseCosts[this.id])+"^((x"+("*"+format(tmp.s.buildScalePower))+")^"+format(tmp[this.layer].buyables[this.id].costExp)+")*"+format(tmp.s.buildingBaseCosts[this.id])+"/"+format(tmp.s.divBuildCosts)):("价格: " + formatWhole(data.cost) + " GP"))+"\n\
                    等级: " + formatWhole(player[this.layer].buyables[this.id])+(data.freeLevels.gt(0)?(" + "+formatWhole(data.freeLevels)):"") + "\n\
                   "+(tmp.nerdMode?("公式: 等级^sqrt(空间能量)*等级*4"):(" 空间能量加成点数和声望获取 " + format(data.effect) +"x"))
                },
                unlocked() { return player[this.layer].unlocked }, 
                canAfford() {
                    return player.g.power.gte(tmp[this.layer].buyables[this.id].cost) && layers.s.space().gt(0)},
                buy() { 
                    cost = tmp[this.layer].buyables[this.id].cost
                    player.g.power = player.g.power.sub(cost)
					player.s.spent = player.s.spent.plus(1);
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                },
				target() { return player.g.power.times(tmp.s.divBuildCosts).div(tmp.s.buildingBaseCosts[this.id]).max(1).log(tmp.s.buildingBaseCosts[this.id]).root(tmp[this.layer].buyables[this.id].costExp).div(tmp.s.buildScalePower).plus(1).floor().min(player[this.layer].buyables[this.id].plus(layers.s.space())) }, 
                buyMax() {
					if (!this.canAfford() || !this.unlocked()) return;
					let target = this.target();
					player.s.spent = player.s.spent.plus(target.sub(player[this.layer].buyables[this.id]))
					player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].max(target);
				}, 
                style: {'height':'100px'},
				sellOne() {
					let amount = getBuyableAmount(this.layer, this.id)
					if (!hasMilestone("q", 5) || amount.lt(1)) return;
					setBuyableAmount(this.layer, this.id, amount.sub(1))
                    player[this.layer].spent = player[this.layer].spent.sub(1).max(0);
				},
				canSellOne() { return hasMilestone("q", 5) },
				autoed() { return player.s.autoBld && hasMilestone("q", 7) },
			},
			12: {
				title: "第二建筑",
				costExp() { 
					let exp = 1.35;
					if (hasUpgrade("s", 31) && player.i.buyables[12].gte(5)) exp -= 0.04*(15-this.id);
					return exp;
				},
				cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
					let base = tmp.s.buildingBaseCosts[this.id];
					return Decimal.pow(base, x.times(tmp.s.buildScalePower).pow(tmp[this.layer].buyables[this.id].costExp)).times(base).div(tmp.s.divBuildCosts);
                },
				freeLevels() {
					let levels = tmp.s.freeSpaceBuildings.plus(tmp.s.freeSpaceBuildings1to4);
					if (hasUpgrade("s", 32) && player.i.buyables[12].gte(5)) levels = levels.plus(player.s.buyables[12+1]||0);
					return levels;
				},
				effect(x=player[this.layer].buyables[this.id]) { // Effects of owning x of the items, x is a decimal
					let eff = x.plus(tmp.s.buyables[this.id].freeLevels).times(tmp.s.buildingPower).sqrt();
					if (player.hs.unlocked) eff = eff.pow(buyableEffect("hs", 22));
					return eff;
                },
				display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    return (tmp.nerdMode?("价格公式: "+format(tmp.s.buildingBaseCosts[this.id])+"^((x*"+format(tmp.s.buildScalePower)+")^"+format(tmp[this.layer].buyables[this.id].costExp)+")*"+format(tmp.s.buildingBaseCosts[this.id])+"/"+format(tmp.s.divBuildCosts)):("价格: " + formatWhole(data.cost) + " GP"))+"\n\
                    等级: " + formatWhole(player[this.layer].buyables[this.id])+(data.freeLevels.gt(0)?(" + "+formatWhole(data.freeLevels)):"") + "\n\
                    "+(tmp.nerdMode?("公式: sqrt(等级)"):("加成增幅器和生成器底数 +" + format(data.effect)))
                },
                unlocked() { return player[this.layer].unlocked }, 
                canAfford() {
                    return player.g.power.gte(tmp[this.layer].buyables[this.id].cost) && layers.s.space().gt(0)},
                buy() { 
                    cost = tmp[this.layer].buyables[this.id].cost
                    player.g.power = player.g.power.sub(cost)
					player.s.spent = player.s.spent.plus(1);
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                },
				target() { return player.g.power.times(tmp.s.divBuildCosts).div(tmp.s.buildingBaseCosts[this.id]).max(1).log(tmp.s.buildingBaseCosts[this.id]).root(tmp[this.layer].buyables[this.id].costExp).div(tmp.s.buildScalePower).plus(1).floor().min(player[this.layer].buyables[this.id].plus(layers.s.space())) }, 
                buyMax() {
					if (!this.canAfford() || !this.unlocked()) return;
					let target = this.target();
					player.s.spent = player.s.spent.plus(target.sub(player[this.layer].buyables[this.id]))
					player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].max(target);
				}, 
                style: {'height':'100px'},
				sellOne() {
					let amount = getBuyableAmount(this.layer, this.id)
					if (!hasMilestone("q", 5) || amount.lt(1)) return;
					setBuyableAmount(this.layer, this.id, amount.sub(1))
                    player[this.layer].spent = player[this.layer].spent.sub(1).max(0);
				},
				canSellOne() { return hasMilestone("q", 5) },
				autoed() { return player.s.autoBld && hasMilestone("q", 7) },
			},
			13: {
				title: "第三建筑",
				costExp() { 
					let exp = 1.35;
					if (hasUpgrade("s", 31) && player.i.buyables[12].gte(5)) exp -= 0.04*(15-this.id);
					return exp;
				},
				cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
					let base = tmp.s.buildingBaseCosts[this.id];
					return Decimal.pow(base, x.times(tmp.s.buildScalePower).pow(tmp[this.layer].buyables[this.id].costExp)).times(base).div(tmp.s.divBuildCosts);
                },
				freeLevels() {
					let levels = tmp.s.freeSpaceBuildings.plus(tmp.s.freeSpaceBuildings1to4);
					if (hasUpgrade("s", 32) && player.i.buyables[12].gte(5)) levels = levels.plus(player.s.buyables[13+1]||0);
					return levels;
				},
				effect(x=player[this.layer].buyables[this.id]) { // Effects of owning x of the items, x is a decimal
					let eff = Decimal.pow(1e18, x.plus(tmp.s.buyables[this.id].freeLevels).times(tmp.s.buildingPower).pow(0.9))
					if (player.hs.unlocked) eff = eff.pow(buyableEffect("hs", 23));
					eff = softcap("spaceBuilding3", eff);
					return eff;
                },
				display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    return (tmp.nerdMode?("价格公式: "+format(tmp.s.buildingBaseCosts[this.id])+"^((x*"+format(tmp.s.buildScalePower)+")^"+format(tmp[this.layer].buyables[this.id].costExp)+")*"+format(tmp.s.buildingBaseCosts[this.id])+"/"+format(tmp.s.divBuildCosts)):("价格: " + formatWhole(data.cost) + " GP"))+"\n\
                    等级: " + formatWhole(player[this.layer].buyables[this.id])+(data.freeLevels.times(tmp.s.buildingPower).gt(0)?(" + "+formatWhole(data.freeLevels)):"") + "\n\
                    "+(tmp.nerdMode?("公式: "+(data.effect.gte("e3e9")?"10^((等级^0.3)*5.45e6)":"1e18^(等级^0.9)")):("将增幅器和生成器的价格除以 " + format(data.effect)))
                },
                unlocked() { return player[this.layer].unlocked }, 
                canAfford() {
                    return player.g.power.gte(tmp[this.layer].buyables[this.id].cost) && layers.s.space().gt(0)},
                buy() { 
                    cost = tmp[this.layer].buyables[this.id].cost
                    player.g.power = player.g.power.sub(cost)
					player.s.spent = player.s.spent.plus(1);
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                },
                target() { return player.g.power.times(tmp.s.divBuildCosts).div(tmp.s.buildingBaseCosts[this.id]).max(1).log(tmp.s.buildingBaseCosts[this.id]).root(tmp[this.layer].buyables[this.id].costExp).div(tmp.s.buildScalePower).plus(1).floor().min(player[this.layer].buyables[this.id].plus(layers.s.space())) }, 
                buyMax() {
					if (!this.canAfford() || !this.unlocked()) return;
					let target = this.target();
					player.s.spent = player.s.spent.plus(target.sub(player[this.layer].buyables[this.id]))
					player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].max(target);
				}, 
                style: {'height':'100px'},
				sellOne() {
					let amount = getBuyableAmount(this.layer, this.id)
					if (!hasMilestone("q", 5) || amount.lt(1)) return;
					setBuyableAmount(this.layer, this.id, amount.sub(1))
                    player[this.layer].spent = player[this.layer].spent.sub(1).max(0);
				},
				canSellOne() { return hasMilestone("q", 5) },
				autoed() { return player.s.autoBld && hasMilestone("q", 7) },
			},
			14: {
				title: "第四建筑",
				costExp() { 
					let exp = 1.35;
					if (hasUpgrade("s", 31) && player.i.buyables[12].gte(5)) exp -= 0.04*(15-this.id);
					return exp;
				},
				cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
					let base = tmp.s.buildingBaseCosts[this.id];
					let cost = Decimal.pow(base, x.times(tmp.s.buildScalePower).pow(tmp[this.layer].buyables[this.id].costExp)).times(base);
					if (hasUpgrade("s", 15)) cost = cost.root(3);
					return cost.div(tmp.s.divBuildCosts);
                },
				freeLevels() {
					let levels = tmp.s.freeSpaceBuildings.plus(tmp.s.freeSpaceBuildings1to4);
					if (hasUpgrade("s", 32) && player.i.buyables[12].gte(5)) levels = levels.plus(player.s.buyables[14+1]||0);
					return levels;
				},
				effect(x=player[this.layer].buyables[this.id]) { // Effects of owning x of the items, x is a decimal
					let ret = x.plus(tmp.s.buyables[this.id].freeLevels).times(tmp.s.buildingPower).times((hasUpgrade("s", 15))?3:1).add(1).pow(1.25);
					ret = softcap("spaceBuilding4", ret);
					if (player.hs.unlocked) ret = ret.times(buyableEffect("hs", 24));
					return ret;
                },
				display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
					let extForm = hasUpgrade("s", 15)?3:1
                    return (tmp.nerdMode?("价格公式: "+format(tmp.s.buildingBaseCosts[this.id])+"^((x*"+format(tmp.s.buildScalePower)+")^"+format(tmp[this.layer].buyables[this.id].costExp)+")*"+format(tmp.s.buildingBaseCosts[this.id])+(hasUpgrade("s", 15)?"^(1/3)":"")+"/"+format(tmp.s.divBuildCosts)):("价格: " + formatWhole(data.cost) + " GP"))+"\n\
                    等级: " + formatWhole(player[this.layer].buyables[this.id])+(data.freeLevels.gt(0)?(" + "+formatWhole(data.freeLevels)):"") + "\n\
					"+(tmp.nerdMode?("公式: "+(data.effect.gte(1e6)?("log(等级"+(extForm==1?"":"*3")+"+1)*2.08e5"):("(等级"+(extForm==1?"":"*3")+"+1)^1.25"))):("<b>一折</b> 效果提升至 " + format(data.effect) + " 次幂"))
                },
                unlocked() { return player[this.layer].unlocked&&hasUpgrade("s", 14) }, 
                canAfford() {
                    return player.g.power.gte(tmp[this.layer].buyables[this.id].cost) && layers.s.space().gt(0)},
                buy() { 
                    cost = tmp[this.layer].buyables[this.id].cost
                    player.g.power = player.g.power.sub(cost)
					player.s.spent = player.s.spent.plus(1);
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                },
                target() { return player.g.power.times(tmp.s.divBuildCosts).pow(hasUpgrade("s", 15)?3:1).div(tmp.s.buildingBaseCosts[this.id]).max(1).log(tmp.s.buildingBaseCosts[this.id]).root(tmp[this.layer].buyables[this.id].costExp).div(tmp.s.buildScalePower).plus(1).floor().min(player[this.layer].buyables[this.id].plus(layers.s.space())) }, 
                buyMax() {
					if (!this.canAfford() || !this.unlocked()) return;
					let target = this.target();
					player.s.spent = player.s.spent.plus(target.sub(player[this.layer].buyables[this.id]))
					player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].max(target);
				}, 
                style: {'height':'100px'},
				sellOne() {
					let amount = getBuyableAmount(this.layer, this.id)
					if (!hasMilestone("q", 5) || amount.lt(1)) return;
					setBuyableAmount(this.layer, this.id, amount.sub(1))
                    player[this.layer].spent = player[this.layer].spent.sub(1).max(0);
				},
				canSellOne() { return hasMilestone("q", 5) },
				autoed() { return player.s.autoBld && hasMilestone("q", 7) },
			},
			15: {
				title: "第五建筑",
				cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
					let base = tmp.s.buildingBaseCosts[this.id];
					let cost = Decimal.pow(base, x.times(tmp.s.buildScalePower).pow(1.35)).times(base);
					return cost.div(tmp.s.divBuildCosts);
                },
				freeLevels() {
					let levels = tmp.s.freeSpaceBuildings;
					if (hasUpgrade("s", 32) && player.i.buyables[12].gte(5)) levels = levels.plus(player.s.buyables[15+1]||0);
					return levels;
				},
				effect(x=player[this.layer].buyables[this.id]) { // Effects of owning x of the items, x is a decimal
					let ret = x.plus(tmp.s.buyables[this.id].freeLevels).times(tmp.s.buildingPower).div(2);
					if (hasUpgrade("q", 32)) ret = ret.times(2);
					if (player.hs.unlocked) ret = ret.times(buyableEffect("hs", 25));
					return ret.floor();
                },
				display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    return (tmp.nerdMode?("价格公式: "+format(tmp.s.buildingBaseCosts[this.id])+"^((x*"+format(tmp.s.buildScalePower)+")^1.35)*"+format(tmp.s.buildingBaseCosts[this.id])+"/"+format(tmp.s.divBuildCosts)):("价格: " + formatWhole(data.cost) + " GP"))+"\n\
                    等级: " + formatWhole(player[this.layer].buyables[this.id])+(data.freeLevels.gt(0)?(" + "+formatWhole(data.freeLevels)):"") + "\n\
					"+(tmp.nerdMode?("公式: 等级"+(hasUpgrade("q", 32)?"":"/2")):("为之前的建筑增加 " + formatWhole(data.effect)+" 等级。"))
                },
                unlocked() { return player[this.layer].unlocked&&hasUpgrade("s", 25) }, 
                canAfford() {
                    return player.g.power.gte(tmp[this.layer].buyables[this.id].cost) && layers.s.space().gt(0)},
                buy() { 
                    cost = tmp[this.layer].buyables[this.id].cost
                    player.g.power = player.g.power.sub(cost)
					player.s.spent = player.s.spent.plus(1);
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                },
                target() { return player.g.power.times(tmp.s.divBuildCosts).div(tmp.s.buildingBaseCosts[this.id]).max(1).log(tmp.s.buildingBaseCosts[this.id]).root(1.35).div(tmp.s.buildScalePower).plus(1).floor().min(player[this.layer].buyables[this.id].plus(layers.s.space())) }, 
                buyMax() {
					if (!this.canAfford() || !this.unlocked()) return;
					let target = this.target();
					player.s.spent = player.s.spent.plus(target.sub(player[this.layer].buyables[this.id]))
					player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].max(target);
				}, 
                style: {'height':'100px'},
				sellOne() {
					let amount = getBuyableAmount(this.layer, this.id)
					if (!hasMilestone("q", 5) || amount.lt(1)) return;
					setBuyableAmount(this.layer, this.id, amount.sub(1))
                    player[this.layer].spent = player[this.layer].spent.sub(1).max(0);
				},
				canSellOne() { return hasMilestone("q", 5) },
				autoed() { return player.s.autoBld && hasMilestone("q", 7) },
			},
			16: {
				title: "第六建筑",
				costExp() { return 1.35+(this.id-15)*0.3 },
				cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
					let base = tmp.s.buildingBaseCosts[this.id];
					let cost = Decimal.pow(base, x.times(tmp.s.buildScalePower).pow(tmp.s.buyables[this.id].costExp)).times(base);
					return cost.div(tmp.s.divBuildCosts);
                },
				freeLevels() {
					let levels = new Decimal(0);
					if (hasUpgrade("s", 32) && player.i.buyables[12].gte(5)) levels = levels.plus(player.s.buyables[16+1]||0);
					return levels;
				},
				effect(x=player[this.layer].buyables[this.id]) { // Effects of owning x of the items, x is a decimal
					let ret = x.plus(tmp.s.buyables[this.id].freeLevels).times(tmp.s.buildingPower).plus(1).sqrt();
					if (player.hs.unlocked) ret = ret.pow(buyableEffect("hs", 26));
					return ret.floor();
                },
				display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    return (tmp.nerdMode?("价格公式: "+format(tmp.s.buildingBaseCosts[this.id])+"^((x*"+format(tmp.s.buildScalePower)+")^"+format(data.costExp)+")*"+format(tmp.s.buildingBaseCosts[this.id])+"/"+format(tmp.s.divBuildCosts)):("价格: " + formatWhole(data.cost) + " GP"))+"\n\
                    等级: " + formatWhole(player[this.layer].buyables[this.id]) + (data.freeLevels.gt(0)?(" + "+formatWhole(data.freeLevels)):"") + "\n\
					"+(tmp.nerdMode?("公式: sqrt(level+1)"):("增幅恶魂获取 " + format(data.effect)+"x。"))
                },
                unlocked() { return player[this.layer].unlocked&&player.i.buyables[11].gte(1) }, 
                canAfford() {
                    return player.g.power.gte(tmp[this.layer].buyables[this.id].cost) && layers.s.space().gt(0)},
                buy() { 
                    cost = tmp[this.layer].buyables[this.id].cost
                    player.g.power = player.g.power.sub(cost)
					player.s.spent = player.s.spent.plus(1);
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                },
                target() { return player.g.power.times(tmp.s.divBuildCosts).div(tmp.s.buildingBaseCosts[this.id]).max(1).log(tmp.s.buildingBaseCosts[this.id]).root(tmp.s.buyables[this.id].costExp).div(tmp.s.buildScalePower).plus(1).floor().min(player[this.layer].buyables[this.id].plus(layers.s.space())) }, 
                buyMax() {
					if (!this.canAfford() || !this.unlocked()) return;
					let target = this.target();
					player.s.spent = player.s.spent.plus(target.sub(player[this.layer].buyables[this.id]))
					player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].max(target);
				}, 
                style: {'height':'100px'},
				sellOne() {
					let amount = getBuyableAmount(this.layer, this.id)
					if (!hasMilestone("q", 5) || amount.lt(1)) return;
					setBuyableAmount(this.layer, this.id, amount.sub(1))
                    player[this.layer].spent = player[this.layer].spent.sub(1).max(0);
				},
				canSellOne() { return hasMilestone("q", 5) },
				autoed() { return player.s.autoBld && hasMilestone("q", 7) },
			},
			17: {
				title: "第七建筑",
				costExp() { return 1.35+(this.id-15)*0.3 },
				cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
					let base = tmp.s.buildingBaseCosts[this.id];
					let cost = Decimal.pow(base, x.times(tmp.s.buildScalePower).pow(tmp.s.buyables[this.id].costExp)).times(base);
					return cost.div(tmp.s.divBuildCosts);
                },
				freeLevels() {
					let levels = new Decimal(0);
					if (hasUpgrade("s", 32) && player.i.buyables[12].gte(5)) levels = levels.plus(player.s.buyables[17+1]||0);
					return levels;
				},
				effect(x=player[this.layer].buyables[this.id]) { // Effects of owning x of the items, x is a decimal
					let ret = Decimal.pow("1e20000", x.plus(tmp.s.buyables[this.id].freeLevels).times(tmp.s.buildingPower).pow(1.2));
					if (player.hs.unlocked) ret = ret.pow(buyableEffect("hs", 27));
					return ret.floor();
                },
				display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    return (tmp.nerdMode?("价格公式: "+format(tmp.s.buildingBaseCosts[this.id])+"^((x*"+format(tmp.s.buildScalePower)+")^"+format(data.costExp)+")*"+format(tmp.s.buildingBaseCosts[this.id])+"/"+format(tmp.s.divBuildCosts)):("价格: " + formatWhole(data.cost) + " GP"))+"\n\
                    等级: " + formatWhole(player[this.layer].buyables[this.id]) + (data.freeLevels.gt(0)?(" + "+formatWhole(data.freeLevels)):"") + "\n\
					"+(tmp.nerdMode?("公式: 1e20,000^(level^1.2)"):("将幽魂的价格除以 " + format(data.effect)+"。"))
                },
                unlocked() { return player[this.layer].unlocked&&player.i.buyables[11].gte(2) }, 
                canAfford() {
                    return player.g.power.gte(tmp[this.layer].buyables[this.id].cost) && layers.s.space().gt(0)},
                buy() { 
                    cost = tmp[this.layer].buyables[this.id].cost
                    player.g.power = player.g.power.sub(cost)
					player.s.spent = player.s.spent.plus(1);
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                },
                target() { return player.g.power.times(tmp.s.divBuildCosts).div(tmp.s.buildingBaseCosts[this.id]).max(1).log(tmp.s.buildingBaseCosts[this.id]).root(tmp.s.buyables[this.id].costExp).div(tmp.s.buildScalePower).plus(1).floor().min(player[this.layer].buyables[this.id].plus(layers.s.space())) }, 
                buyMax() {
					if (!this.canAfford() || !this.unlocked()) return;
					let target = this.target();
					player.s.spent = player.s.spent.plus(target.sub(player[this.layer].buyables[this.id]))
					player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].max(target);
				}, 
                style: {'height':'100px'},
				sellOne() {
					let amount = getBuyableAmount(this.layer, this.id)
					if (!hasMilestone("q", 5) || amount.lt(1)) return;
					setBuyableAmount(this.layer, this.id, amount.sub(1))
                    player[this.layer].spent = player[this.layer].spent.sub(1).max(0);
				},
				canSellOne() { return hasMilestone("q", 5) },
				autoed() { return player.s.autoBld && hasMilestone("q", 7) },
			},
			18: {
				title: "第八建筑",
				costExp() { return 1.35+(this.id-15)*0.3 },
				cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
					let base = tmp.s.buildingBaseCosts[this.id];
					let cost = Decimal.pow(base, x.times(tmp.s.buildScalePower).pow(tmp.s.buyables[this.id].costExp)).times(base);
					return cost.div(tmp.s.divBuildCosts);
                },
				freeLevels() {
					let levels = new Decimal(0);
					if (hasUpgrade("s", 32) && player.i.buyables[12].gte(5)) levels = levels.plus(player.s.buyables[18+1]||0);
					return levels;
				},
				effect(x=player[this.layer].buyables[this.id]) { // Effects of owning x of the items, x is a decimal
					let ret = x.plus(tmp.s.buyables[this.id].freeLevels).times(tmp.s.buildingPower).div(1.5)
					if (player.hs.unlocked) ret = ret.times(buyableEffect("hs", 28));
					return ret;
                },
				display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    return (tmp.nerdMode?("价格公式: "+format(tmp.s.buildingBaseCosts[this.id])+"^((x*"+format(tmp.s.buildScalePower)+")^"+format(data.costExp)+")*"+format(tmp.s.buildingBaseCosts[this.id])+"/"+format(tmp.s.divBuildCosts)):("价格: " + formatWhole(data.cost) + " GP"))+"\n\
                    等级: " + formatWhole(player[this.layer].buyables[this.id]) + (data.freeLevels.gt(0)?(" + "+formatWhole(data.freeLevels)):"") + "\n\
					"+(tmp.nerdMode?("公式: level/1.5"):("获得 " + format(data.effect)+" 个免费诡异层。"))
                },
                unlocked() { return player[this.layer].unlocked&&player.i.buyables[11].gte(3) }, 
                canAfford() {
                    return player.g.power.gte(tmp[this.layer].buyables[this.id].cost) && layers.s.space().gt(0)},
                buy() { 
                    cost = tmp[this.layer].buyables[this.id].cost
                    player.g.power = player.g.power.sub(cost)
					player.s.spent = player.s.spent.plus(1);
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                },
                target() { return player.g.power.times(tmp.s.divBuildCosts).div(tmp.s.buildingBaseCosts[this.id]).max(1).log(tmp.s.buildingBaseCosts[this.id]).root(tmp.s.buyables[this.id].costExp).div(tmp.s.buildScalePower).plus(1).floor().min(player[this.layer].buyables[this.id].plus(layers.s.space())) }, 
                buyMax() {
					if (!this.canAfford() || !this.unlocked()) return;
					let target = this.target();
					player.s.spent = player.s.spent.plus(target.sub(player[this.layer].buyables[this.id]))
					player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].max(target);
				}, 
                style: {'height':'100px'},
				sellOne() {
					let amount = getBuyableAmount(this.layer, this.id)
					if (!hasMilestone("q", 5) || amount.lt(1)) return;
					setBuyableAmount(this.layer, this.id, amount.sub(1))
                    player[this.layer].spent = player[this.layer].spent.sub(1).max(0);
				},
				canSellOne() { return hasMilestone("q", 5) },
				autoed() { return player.s.autoBld && hasMilestone("q", 7) },
			},
			19: {
				title: "第九建筑",
				costExp() { return 1.35+(this.id-15)*0.3 },
				cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
					let base = tmp.s.buildingBaseCosts[this.id];
					let cost = Decimal.pow(base, x.times(tmp.s.buildScalePower).pow(tmp.s.buyables[this.id].costExp)).times(base);
					return cost.div(tmp.s.divBuildCosts);
                },
				freeLevels() {
					let levels = new Decimal(0);
					if (hasUpgrade("s", 32) && player.i.buyables[12].gte(5)) levels = levels.plus(player.s.buyables[19+1]||0);
					return levels;
				},
				effect(x=player[this.layer].buyables[this.id]) { // Effects of owning x of the items, x is a decimal
					let ret = x.plus(tmp.s.buyables[this.id].freeLevels).times(tmp.s.buildingPower).div(1e3).plus(1)
					if (player.hs.unlocked) ret = ret.pow(buyableEffect("hs", 29));
					return softcap("spaceBuilding9_2", softcap("spaceBuilding9", ret));
                },
				display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    return (tmp.nerdMode?("价格公式: "+format(tmp.s.buildingBaseCosts[this.id])+"^((x*"+format(tmp.s.buildScalePower)+")^"+format(data.costExp)+")*"+format(tmp.s.buildingBaseCosts[this.id])+"/"+format(tmp.s.divBuildCosts)):("价格: " + formatWhole(data.cost) + " GP"))+"\n\
                    等级: " + formatWhole(player[this.layer].buyables[this.id]) + (data.freeLevels.gt(0)?(" + "+formatWhole(data.freeLevels)):"") + "\n\
					"+(tmp.nerdMode?("格式: level/1,000+1"):("超空间能量获得指数增幅 " + format(data.effect)+"x。"))
                },
                unlocked() { return player[this.layer].unlocked&&player.i.buyables[11].gte(4) }, 
                canAfford() {
                    return player.g.power.gte(tmp[this.layer].buyables[this.id].cost) && layers.s.space().gt(0)},
                buy() { 
                    cost = tmp[this.layer].buyables[this.id].cost
                    player.g.power = player.g.power.sub(cost)
					player.s.spent = player.s.spent.plus(1);
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                },
                target() { return player.g.power.times(tmp.s.divBuildCosts).div(tmp.s.buildingBaseCosts[this.id]).max(1).log(tmp.s.buildingBaseCosts[this.id]).root(tmp.s.buyables[this.id].costExp).div(tmp.s.buildScalePower).plus(1).floor().min(player[this.layer].buyables[this.id].plus(layers.s.space())) }, 
                buyMax() {
					if (!this.canAfford() || !this.unlocked()) return;
					let target = this.target();
					player.s.spent = player.s.spent.plus(target.sub(player[this.layer].buyables[this.id]))
					player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].max(target);
				}, 
                style: {'height':'100px'},
				sellOne() {
					let amount = getBuyableAmount(this.layer, this.id)
					if (!hasMilestone("q", 5) || amount.lt(1)) return;
					setBuyableAmount(this.layer, this.id, amount.sub(1))
                    player[this.layer].spent = player[this.layer].spent.sub(1).max(0);
				},
				canSellOne() { return hasMilestone("q", 5) },
				autoed() { return player.s.autoBld && hasMilestone("q", 7) },
			},
			20: {
				title: "第十建筑",
				costExp() { return 1.35+(this.id-15)*0.3 },
				cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
					let base = tmp.s.buildingBaseCosts[this.id];
					let cost = Decimal.pow(base, x.times(tmp.s.buildScalePower).pow(tmp.s.buyables[this.id].costExp)).times(base);
					return cost.div(tmp.s.divBuildCosts);
                },
				freeLevels() {
					let levels = new Decimal(0);
					return levels;
				},
				effect(x=player[this.layer].buyables[this.id]) { // Effects of owning x of the items, x is a decimal
					let ret = x.plus(tmp.s.buyables[this.id].freeLevels).times(tmp.s.buildingPower).div(250)
					if (player.hs.unlocked) ret = ret.times(buyableEffect("hs", 30));
					return ret;
                },
				display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    return (tmp.nerdMode?("价格公式: "+format(tmp.s.buildingBaseCosts[this.id])+"^((x*"+format(tmp.s.buildScalePower)+")^"+format(data.costExp)+")*"+format(tmp.s.buildingBaseCosts[this.id])+"/"+format(tmp.s.divBuildCosts)):("价格: " + formatWhole(data.cost) + " GP"))+"\n\
                    等级: " + formatWhole(player[this.layer].buyables[this.id]) + (data.freeLevels.gt(0)?(" + "+formatWhole(data.freeLevels)):"") + "\n\
					"+(tmp.nerdMode?("公式: (level/2.5)%"):("超建筑增益加成 " + format(data.effect.times(100))+"%。"))
                },
                unlocked() { return player[this.layer].unlocked&&player.i.buyables[11].gte(5) }, 
                canAfford() {
                    return player.g.power.gte(tmp[this.layer].buyables[this.id].cost) && layers.s.space().gt(0)},
                buy() { 
                    cost = tmp[this.layer].buyables[this.id].cost
                    player.g.power = player.g.power.sub(cost)
					player.s.spent = player.s.spent.plus(1);
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                },
                target() { return player.g.power.times(tmp.s.divBuildCosts).div(tmp.s.buildingBaseCosts[this.id]).max(1).log(tmp.s.buildingBaseCosts[this.id]).root(tmp.s.buyables[this.id].costExp).div(tmp.s.buildScalePower).plus(1).floor().min(player[this.layer].buyables[this.id].plus(layers.s.space())) }, 
                buyMax() {
					if (!this.canAfford() || !this.unlocked()) return;
					let target = this.target();
					player.s.spent = player.s.spent.plus(target.sub(player[this.layer].buyables[this.id]))
					player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].max(target);
				}, 
                style: {'height':'100px'},
				sellOne() {
					let amount = getBuyableAmount(this.layer, this.id)
					if (!hasMilestone("q", 5) || amount.lt(1)) return;
					setBuyableAmount(this.layer, this.id, amount.sub(1))
                    player[this.layer].spent = player[this.layer].spent.sub(1).max(0);
				},
				canSellOne() { return hasMilestone("q", 5) },
				autoed() { return player.s.autoBld && hasMilestone("q", 7) },
			},
		},
		milestones: {
			0: {
				requirementDescription: "2 空间能量",
				done() { return player.s.best.gte(2) || hasAchievement("a", 71) },
				effectDescription: "重置时保留增幅器和生成器里程碑。",
			},
			1: {
				requirementDescription: "3 空间能量",
				done() { return player.s.best.gte(3) || hasAchievement("a", 41) || hasAchievement("a", 71) },
				effectDescription: "重置时保留声望升级。",
			},
			2: {
				requirementDescription: "4 空间能量",
				done() { return player.s.best.gte(4) || hasAchievement("a", 71) },
				effectDescription: "对任何重置保留生成器升级。",
			},
			3: {
				requirementDescription: "5 空间能量",
				done() { return player.s.best.gte(5) || hasAchievement("a", 71) },
				effectDescription: "解锁自动生成器。",
				toggles: [["g", "auto"]],
			},
			4: {
				requirementDescription: "8 空间能量",
				done() { return player.s.best.gte(8) || hasAchievement("a", 71) },
				effectDescription: "生成器不再重置任何东西。",
			},
		},
})
/*
                                     
                 bbbbbbbb            
                 b::::::b            
                 b::::::b            
                 b::::::b            
                  b:::::b            
    ssssssssss    b:::::bbbbbbbbb    
  ss::::::::::s   b::::::::::::::bb  
ss:::::::::::::s  b::::::::::::::::b 
s::::::ssss:::::s b:::::bbbbb:::::::b
 s:::::s  ssssss  b:::::b    b::::::b
   s::::::s       b:::::b     b:::::b
      s::::::s    b:::::b     b:::::b
ssssss   s:::::s  b:::::b     b:::::b
s:::::ssss::::::s b:::::bbbbbb::::::b
s::::::::::::::s  b::::::::::::::::b 
 s:::::::::::ss   b:::::::::::::::b  
  sssssssssss     bbbbbbbbbbbbbbbb   
                                     
                                     
                                     
                                     
                                     
                                     
                                     
*/
addLayer("sb", {
        name: "super boosters", // This is optional, only used in a few places, If absent it just uses the layer id.
        symbol: "SB", // This appears on the layer's node. Default is the id with the first letter capitalized
        position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
        color: "#504899",
        requires: new Decimal(100), // Can be a function that takes requirement increases into account
        resource: "超级增幅器", // Name of prestige currency
        baseResource: "增幅器", // Name of resource prestige is based on
        baseAmount() {return player.b.points}, // Get the current amount of baseResource
		roundUpCost: true,
        type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
		branches: ["b"],
        exponent() { return ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?1.075:1.25 }, // Prestige currency exponent
		base() { return ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?1.025:1.05 },
		gainMult() { 
			let mult = new Decimal(1);
			if (hasUpgrade("ss", 21)) mult = mult.div(1.2);
			if ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false) mult = mult.div(4/3);
			return mult;
		},
		autoPrestige() { return player.sb.auto && hasMilestone("q", 4) && player.ma.current!="sb" },
		canBuyMax() { return hasMilestone("q", 7) },
        row: 2, // Row the layer is in on the tree (0 is the first row)
        hotkeys: [
            {key: "B", description: "按 Shift+B 进行超级增幅器重置。", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
        ],
        layerShown(){return player.t.unlocked&&player.e.unlocked&&player.s.unlocked},
		automate() {},
		resetsNothing() { return hasMilestone("q", 5)&&player.ma.current!="sb" },
		effectBase() {
			let base = new Decimal(5);
			if (hasChallenge("h", 12)) base = base.plus(.25);
			if (hasUpgrade("e", 31) && player.i.buyables[12].gte(3)) base = base.plus(buyableEffect("e", 11).second);
			
			if (player.o.unlocked) base = base.times(buyableEffect("o", 12));
			if (((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes('b'):false) && hasUpgrade("b", 12)) base = base.times(upgradeEffect("b", 12).max(1));
			if (((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes('b'):false) && hasUpgrade("b", 13)) base = base.times(upgradeEffect("b", 13).max(1));
			base = base.times(tmp.n.dustEffs.blue);
			if (((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes("h"):false) && hasChallenge("h", 12)) base = base.times(player.hs.points.plus(1));
			if (player.en.unlocked) base = base.pow(tmp.en.swEff);
			if (player.c.unlocked && tmp.c) base = base.pow(tmp.c.eff5);
			return base
		},
		effect() {
			if (!unl(this.layer)) return new Decimal(1);
			return Decimal.pow(this.effectBase(), player.sb.points).max(0);
		},
		effectDescription() {
			return "增幅增幅器底数 "+format(tmp.sb.effect)+"x"+(tmp.nerdMode?("\n (每个 "+format(tmp.sb.effectBase)+"x)"):"")
		},
		doReset(resettingLayer){ 
			let keep = []
            if (layers[resettingLayer].row > this.row) layerDataReset(this.layer, keep)
        },
		spectralEach() {
			if (!((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)) return new Decimal(0);
			return player.sb.points;
		},
		spectralTotal() {
			return tmp.sb.spectralEach.times(player.sb.points);
		},
		tabFormat: ["main-display",
			"prestige-button",
			"blank",
			["display-text", function() { return ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes("sb"):false)?("你的超级增幅器为你提供了 <h3 style='color: #8882ba; text-shadow: #7f78c4 0px 0px 10px;'>"+formatWhole(tmp.sb.spectralTotal)+"</h3> 虚增幅器"+(tmp.nerdMode?(" (每个 "+formatWhole(tmp.sb.spectralEach)+")"):"")+"，计算入增幅器效果，但不计入增幅器相关的升级效果。"):"" }],
		],
		startData() { return {
			unlocked: false,
			points: new Decimal(0),
			best: new Decimal(0),
			first: 0,
			auto: false,
		}},
})
/*
                                     
                                     
                                     
                                     
                                     
                                     
    ssssssssss      ggggggggg   ggggg
  ss::::::::::s    g:::::::::ggg::::g
ss:::::::::::::s  g:::::::::::::::::g
s::::::ssss:::::sg::::::ggggg::::::gg
 s:::::s  ssssss g:::::g     g:::::g 
   s::::::s      g:::::g     g:::::g 
      s::::::s   g:::::g     g:::::g 
ssssss   s:::::s g::::::g    g:::::g 
s:::::ssss::::::sg:::::::ggggg:::::g 
s::::::::::::::s  g::::::::::::::::g 
 s:::::::::::ss    gg::::::::::::::g 
  sssssssssss        gggggggg::::::g 
                             g:::::g 
                 gggggg      g:::::g 
                 g:::::gg   gg:::::g 
                  g::::::ggg:::::::g 
                   gg:::::::::::::g  
                     ggg::::::ggg    
                        gggggg       
*/
addLayer("sg", {
        name: "super generators", // This is optional, only used in a few places, If absent it just uses the layer id.
        symbol: "SG", // This appears on the layer's node. Default is the id with the first letter capitalized
        position: 4, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
        color: "#248239",
        requires: new Decimal(200), // Can be a function that takes requirement increases into account
        resource: "超级生成器", // Name of prestige currency
        baseResource: "生成器", // Name of resource prestige is based on
        baseAmount() {return player.g.points}, // Get the current amount of baseResource
		roundUpCost: true,
        type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
		branches: ["g"],
        exponent() { return ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?1.225:1.25 }, // Prestige currency exponent
		base() { return ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?1.04:1.05 },
		gainMult() { 
			let mult = new Decimal(1);
			if (hasUpgrade("ss", 21)) mult = mult.div(1.2);
			if ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false) mult = mult.div(1.1);
			return mult;
		},
		autoPrestige() { return player.sg.auto && hasMilestone("q", 6) && player.ma.current!="sg" },
		update(diff) {
			player.sg.power = player.sg.power.plus(tmp.sg.effect.times(diff));
			player.sg.time = player.sg.time.plus(diff);
		},
		canBuyMax() { return hasMilestone("q", 7) },
        row: 2, // Row the layer is in on the tree (0 is the first row)
        hotkeys: [
            {key: "G", description: "按 Shift+G 进行超级生成器重置。", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
        ],
		layerShown(){return (hasUpgrade("q", 33)||player.ma.selectionActive)&&player.q.unlocked},
		resetsNothing() { return hasMilestone("q", 6) && player.ma.current!="sg" },
		effectBase() {
			let base = new Decimal(5);
			if (hasUpgrade("ss", 32)) base = base.plus(upgradeEffect("ss", 32));
			if (hasUpgrade("e", 31) && player.i.buyables[12].gte(3)) base = base.plus(buyableEffect("e", 11).second);
			
			if (hasUpgrade("g", 31) && player.i.buyables[12].gte(2)) base = base.times(upgradeEffect("g", 31));
			if (hasUpgrade("ba", 32)) base = base.times(upgradeEffect("ba", 32));
			if (hasUpgrade("hn", 52)) base = base.times(buyableEffect("o", 12));
			if (player.mc.unlocked) base = base.times(clickableEffect("mc", 21));
			if (tmp.m.buyables[16].unlocked) base = base.times(buyableEffect("m", 16));
			if (player.ne.unlocked) base = base.times(tmp.ne.thoughtEff2);
			return base;
		},
		effect() {
			if (!unl(this.layer)) return new Decimal(0);
			let eff = Decimal.pow(this.effectBase(), player.sg.points).sub(1).max(0);
			if (tmp.h.challenges[31].unlocked) eff = eff.times(challengeEffect("h", 31));
			return eff;
		},
		effectDescription() {
			return "生成 "+format(tmp.sg.effect)+" 超级 GP/sec"+(tmp.nerdMode?("\n (每个 "+format(tmp.sg.effectBase)+"x)"):"")
		},
		enEff() {
			if (!unl(this.layer)) return new Decimal(1);
			let eff = player.sg.power.plus(1).sqrt();
			if ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes("sg"):false) eff = eff.pow(2);
			return eff;
		},
		doReset(resettingLayer){ 
			let keep = []
            if (layers[resettingLayer].row > this.row) layerDataReset(this.layer, keep)
        },
		spectralTotal() {
			if (!((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes("sg"):false)) return new Decimal(0);
			return player.sg.time.plus(1).log10().times(player.sg.points.pow(2)).pow(.95).times(1.2).floor();
		},
		tabFormat: ["main-display",
			"prestige-button",
			"blank",
			["display-text",
				function() {return '你有 ' + format(player.sg.power) + ' 超级 GP，增幅生成器底数 '+format(tmp.sg.enEff)+'x'+(tmp.nerdMode?(" (sqrt(x+1))"):"")},
					{}],
			"blank",
			["display-text", function() { return ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes("sg"):false)?("你的超级生成器为你提供了 <h3 style='color: #84b88a; text-shadow: #78c48f 0px 0px 10px;'>"+formatWhole(tmp.sg.spectralTotal)+"</h3> 虚生成器"+(tmp.nerdMode?(" (((log(timeSinceRow4Reset+1)*(SG^2))^0.95)*1.2)"):"")+"，计算入炉管效果，但不计入生成器相关的升级效果。"):"" }],
		],
		startData() { return {
			unlocked: false,
			points: new Decimal(0),
			best: new Decimal(0),
			power: new Decimal(0),
			first: 0,
			auto: false,
			time: new Decimal(0),
		}},
})
/*
                    
                    
hhhhhhh             
h:::::h             
h:::::h             
h:::::h             
 h::::h hhhhh       
 h::::hh:::::hhh    
 h::::::::::::::hh  
 h:::::::hhh::::::h 
 h::::::h   h::::::h
 h:::::h     h:::::h
 h:::::h     h:::::h
 h:::::h     h:::::h
 h:::::h     h:::::h
 h:::::h     h:::::h
 h:::::h     h:::::h
 hhhhhhh     hhhhhhh
                    
                    
                    
                    
                    
                    
                    
*/
addLayer("h", {
        name: "hindrance", // This is optional, only used in a few places, If absent it just uses the layer id.
        symbol: "H", // This appears on the layer's node. Default is the id with the first letter capitalized
        position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
        startData() { return {
            unlocked: false,
			points: new Decimal(0),
			best: new Decimal(0),
			chall31bought: 0,
			first: 0,
			auto: false,
        }},
        color: "#a14040",
        requires: new Decimal(1e30), // Can be a function that takes requirement increases into account
        resource: "障碍灵魂", // Name of prestige currency
        baseResource: "TE", // Name of resource prestige is based on
        baseAmount() {return player.t.energy}, // Get the current amount of baseResource
        type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
        exponent() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?.2:.125) }, // Prestige currency exponent
        gainMult() { // Calculate the multiplier for main currency from bonuses
            mult = new Decimal(1)
			if (hasUpgrade("q", 14)) mult = mult.times(upgradeEffect("q", 14).h);
			if (player.m.unlocked) mult = mult.times(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes("m"):false)?tmp.m.mainHexEff:tmp.m.hexEff);
			if (hasUpgrade("ba", 22)) mult = mult.times(tmp.ba.negBuff);
            return mult
        },
        gainExp() { // Calculate the exponent on main currency from bonuses
            return new Decimal(1)
        },
        row: 3, // Row the layer is in on the tree (0 is the first row)
        hotkeys: [
            {key: "h", description: "按 H 进行障碍重置。", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
        ],
        doReset(resettingLayer){ 
			let keep = [];
			player.q.time = new Decimal(0);
			player.q.energy = new Decimal(0);
			player.h.chall31bought = 0;
			if (hasMilestone("m", 1)) keep.push("challenges")
			if (layers[resettingLayer].row > this.row) {
				layerDataReset(this.layer, keep)
			}
        },
		update(diff) {
			if (hasAchievement("a", 111)) {
				let cd = tmp[this.layer].challenges;
				let auto = hasMilestone("h", 0) && player.h.auto;
				if (cd[31].unlocked && (player.h.activeChallenge==31 || auto)) cd[31].completeInBulk()
				if (cd[32].unlocked && (player.h.activeChallenge==32 || auto)) cd[32].completeInBulk()
			}
		},
        layerShown(){return (player.t.unlocked&&hasMilestone("q", 4))||player.m.unlocked||player.ba.unlocked},
        branches: ["t"],
		effect() { 
			if (!unl(this.layer)) return new Decimal(1);
			let h = player.h.points.times(player.points.plus(1).log("1e1000").plus(1));
			h = softcap("hindr_base", h);
			let eff = h.plus(1).pow(3).pow(hasChallenge("h", 11)?1.2:1).pow(hasUpgrade("ba", 21)?8:1);
			if (hasUpgrade("q", 45) && player.i.buyables[12].gte(6)) eff = eff.pow(100);
			return eff;
		},
		effectDescription() {
			return "增幅点数获取、TE 获取与 TE 上限 "+format(tmp.h.effect)+" ("+(tmp.nerdMode?(tmp.h.effect.gte(15e4)?("(10^sqrt(log(hindranceSpirit/1e3*(log(points+1)+1))/log(1.5e5))+1)^("+((hasChallenge("h", 11)?3.6:3)*(hasUpgrade("ba", 21)?8:1))+")"):("(hindranceSpirit/1e3*(log(points+1)+1)+1)^("+((hasChallenge("h", 11)?3.6:3)*(hasUpgrade("ba", 21)?8:1))+")")):"基于点数")+")"
		},
		costMult11() {
			let mult = new Decimal(1);
			if (inChallenge("h", 11)) mult = mult.times(Decimal.pow(10, Decimal.pow(player.p.upgrades.length, 2)))
			return mult;
		},
		costExp11() {
			let exp = new Decimal(1);
			if (inChallenge("h", 11)) exp = exp.times(Math.pow(player.p.upgrades.length, 2)*4+1)
			return exp;
		},
		costMult11b() {
			let mult = new Decimal(1);
			if (inChallenge("h", 11)) mult = mult.times(player.b.upgrades.length*3+1)
			return mult;
		},
		baseDiv12() {
			let div = new Decimal(1);
			if (inChallenge("h", 12)) div = div.times(player.q.time.sqrt().times(player.sb.points.pow(3).times(3).plus(1)).plus(1))
			return div;
		},
		pointRoot31(x=challengeCompletions("h", 31)) {
			if (hasAchievement("a", 111)) x = 1;
			else if (player.h.activeChallenge==32) x = challengeCompletions("h", 32)*2
			if (x>=20) x = Math.pow(x-19, 1.5)+19
			let root = Decimal.add(2, Decimal.pow(x, 1.5).div(16))
			return root;
		},
		passiveGeneration() { return (hasMilestone("m", 2)&&player.ma.current!="h")?1:0 },
		milestones: {
			0: {
				unlocked() { return ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes("h"):false) },
				requirementDescription: "e300,000,000 障碍灵魂",
				done() { return player.h.points.gte("e3e8") },
				effectDescription: "解锁自动可重复障碍。",
				toggles: [["h", "auto"]],
			},
		},
		challenges: {
			rows: 4,
			cols: 2,
			11: {
				name: "升级荒漠",
				completionLimit: 1,
				challengeDescription: "声望/增幅器升级会无视里程碑进行重置，同时每个声望/增幅器升级夸张地增加其他升级的价格。",
				unlocked() { return player.h.unlocked },
				goal() { return new Decimal(player.ma.current=="h"?"e1.37e8":"1e1325") },
				currencyDisplayName: "点数",
				currencyInternalName: "points",
				rewardDescription: "解锁诡异升级，同时障碍灵魂的效果提升至 1.2 次幂。",
				onStart(testInput=false) { 
					if (testInput && !(hasAchievement("a", 81)&&player.ma.current!="h")) {
						player.p.upgrades = []; 
						player.b.upgrades = [];
					}
				},
			},
			12: {
				name: "速度之魔",
				completionLimit: 1,
				challengeDescription: "增幅器/生成器底数被时间消减（你的超级增幅器会放大此效果）。",
				unlocked() { return hasChallenge("h", 11) },
				goal() { return new Decimal(player.ma.current=="h"?"e5e8":"1e3550") },
				currencyDisplayName: "点数",
				currencyInternalName: "points",
				rewardDescription() { return "超级增幅器底数增加 0.25"+(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes("h"):false)?(" 并以超空间能量加成它"):"")+"。" },
			},
			21: {
				name: "空间紧缺",
				completionLimit: 1,
				challengeDescription: "建筑重置，你的空间变为 10%，建筑效果变为 10%。",
				unlocked() { return hasChallenge("h", 12) },
				goal() { return new Decimal(player.ma.current=="h"?"e5.7e7":"1e435") },
				currencyDisplayName: "GP",
				currencyInternalName: "power",
				currencyLayer: "g",
				rewardDescription: "空间能量加成建筑效果。",
				rewardEffect() { return player.s.points.div(2).times(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes("h"):false)?1.4:1) },
				rewardDisplay() { return format(this.rewardEffect())+"% 增强 （累加）" },
				formula() { return "(x*"+format(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes("h"):false)?.7:.5)+")%" },
				onStart(testInput=false) {
					if (testInput) {
						resetBuyables("s");
						player.s.spent = new Decimal(0);
					}
				},
			},
			22: {
				name: "弱化",
				completionLimit: 1,
				challengeDescription: "只有声望升级、成就奖励和第一建筑能增益点数获取。",
				unlocked() { return hasChallenge("h", 21) },
				goal() { return new Decimal(player.ma.current=="h"?"e8.225e6":"1e3570") },
				currencyDisplayName: "点数",
				currencyInternalName: "points",
				rewardDescription: "<b>点数增益</b> 的硬上限变为软上限。",
			},
			31: {
				name: "永恒",
				scalePower() {
					let power = new Decimal(1);
					if (tmp.m.buyables[15].unlocked) power = power.times(Decimal.sub(1, buyableEffect("m", 15)));
					return power;
				},
				completionLimit() { 
					let lim = 10
					if (hasAchievement("a", 71)) lim += 10;
					if (hasAchievement("a", 74)) lim += 10;
					if ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes("h"):false) lim = Infinity;
					return lim
				},
				challengeDescription() {
					let lim = this.completionLimit();
					let infLim = !isFinite(lim);
					return "你只能买 10 个增强子和扩展时间胶囊（总计），增强子/扩展时间胶囊自动购买已被禁止，同时点数生成被开 "+format(tmp.h.pointRoot31)+" 次根。<br>完成次数: "+formatWhole(challengeCompletions("h", 31))+(infLim?"":("/"+lim));
				},
				unlocked() { return hasChallenge("h", 22) },
				goal() { 
					let comps = Decimal.mul(challengeCompletions("h", 31), tmp.h.challenges[this.id].scalePower);
					if (comps.gte(20)) comps = Decimal.pow(comps.sub(19), 1.95).plus(19);
					return Decimal.pow("1e50", Decimal.pow(comps, 2.5)).times("1e5325") 
				},
				completeInBulk() {
					if (challengeCompletions("h", 31)>=tmp[this.layer].challenges[this.id].completionLimit) return;
					let target = player.points.div("1e5325").max(1).log("1e50").root(2.5)
					if (target.gte(20)) target = target.sub(19).root(1.95).plus(19);
					target = target.div(tmp.h.challenges[this.id].scalePower).plus(1).floor();
					player.h.challenges[this.id] = Math.min(Math.max(player.h.challenges[this.id], target.toNumber()), tmp[this.layer].challenges[this.id].completionLimit);
					if (isNaN(player.h.challenges[this.id])) player.h.challenges[this.id] = 0;
				},
				currencyDisplayName: "点数",
				currencyInternalName: "points",
				rewardDescription() { return "<b>永恒</b> 加成超级 GP 获取，基于"+(hasUpgrade("ss", 33)?"当前游戏时间。":"当前第四行重置后时间。") },
				rewardEffect() { 
					let eff = Decimal.div(9, Decimal.add((hasUpgrade("ss", 33)?(player.timePlayed||0):player.q.time), 1).cbrt().pow(hasUpgrade("ss", 23)?(-1):1)).plus(1).pow(challengeCompletions("h", 31)).times(tmp.n.realDustEffs2?tmp.n.realDustEffs2.blueOrange:new Decimal(1)).pow(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?5:1);
					if (!eff.eq(eff)) eff = new Decimal(1);
					return eff;
				},
				rewardDisplay() { return format(this.rewardEffect())+"x" },
				formula() { return "(9"+(hasUpgrade("ss", 23)?"*":"/")+"cbrt(time+1)+1)^completions" },
			},
			32: {
				name: "D 选项",
				scalePower() {
					let power = new Decimal(1);
					if (tmp.m.buyables[15].unlocked) power = power.times(Decimal.sub(1, buyableEffect("m", 15)));
					return power;
				},
				completionLimit() { 
					let lim = 10;
					if ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes("h"):false) lim = Infinity;
					return lim;
				},
				challengeDescription() { 
					let lim = this.completionLimit();
					let infLim = !isFinite(lim);
					return '之前的所有障碍一起生效（"永恒" 以第 '+formatWhole(challengeCompletions("h", 32)*2+1)+' 级难度生效)<br>完成次数: '+formatWhole(challengeCompletions("h", 32))+(infLim?"":('/'+lim))
				},
				goal() {
					let comps = Decimal.mul(challengeCompletions("h", 32), tmp.h.challenges[this.id].scalePower);
					if (comps.gte(3)) comps = comps.sub(0.96);
					if (comps.gte(3.04)) comps = comps.times(1.425);
					return Decimal.pow("1e1000", Decimal.pow(comps, 3)).times("1e9000");
				},
				completeInBulk() {
					if (challengeCompletions("h", 32)>=tmp[this.layer].challenges[this.id].completionLimit) return;
					let target = player.points.div("1e9000").max(1).log("1e1000").cbrt();
					if (target.gte(3.04)) target = target.div(1.425);
					if (target.gte(3)) target = target.plus(.96);
					target = target.div(tmp.h.challenges[this.id].scalePower).plus(1).floor();
					player.h.challenges[this.id] = Math.min(Math.max(player.h.challenges[this.id], target.toNumber()), tmp[this.layer].challenges[this.id].completionLimit);
					if (isNaN(player.h.challenges[this.id])) player.h.challenges[this.id] = 0;
				},
				currencyDisplayName: "点数",
				currencyInternalName: "points",
				rewardDescription: "<b>D 选项</b> 完成次数加成 TE 获取。",
				rewardEffect() { 
					let eff = softcap("option_d", Decimal.pow(100, Decimal.pow(challengeCompletions("h", 32), 2))).times(tmp.n.realDustEffs2?tmp.n.realDustEffs2.blueOrange:new Decimal(1));
					if (!eff.eq(eff)) eff = new Decimal(1);
					return eff;
				},
				rewardDisplay() { return format(tmp.h.challenges[32].rewardEffect)+"x" },
				formula: "100^(completions^2)",
				unlocked() { return tmp.ps.buyables[11].effects.hindr },
				countsAs: [11,12,21,22,31],
				onStart(testInput=false) { 
					if (testInput) {
						if (!hasAchievement("a", 81)) {
							player.p.upgrades = []; 
							player.b.upgrades = [];
						}
						resetBuyables("s");
						player.s.spent = new Decimal(0);
					}
				},
			},
			41: {
				name: "集中狂怒",
				completionLimit: 1,
				challengeDescription: "进行一次第五行重置，消极和积极都重置了，并且其惩罚被夸张地放大。",
				goal: new Decimal("1e765000"),
				currencyDisplayName: "点数",
				currencyInternalName: "points",
				rewardDescription: "解锁 3 个新的平衡升级。",
				unlocked() { return (tmp.ps.buyables[11].effects.hindr||0)>=2 },
				onStart(testInput=false) {
					if (testInput) {
						doReset("m", true);
						player.h.activeChallenge = 41;
						player.ba.pos = new Decimal(0);
						player.ba.neg = new Decimal(0);
						updateTemp();
						updateTemp();
						updateTemp();
					}
				},
			},
			42: {
				name: "减产",
				completionLimit: 1,
				challengeDescription: "进行一次第五行重置，启用 <b>弱化</b>，并且 2 到 4 层有更高的价格需求。",
				goal: new Decimal("1e19000"),
				currencyDisplayName: "点数",
				currencyInternalName: "points",
				rewardDescription() { return "诡异层价格减少 0."+(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes("h"):false)?"2":"15")+"，解锁两个新的子空间升级。" },
				unlocked() { return (tmp.ps.buyables[11].effects.hindr||0)>=3 },
				countsAs: [22],
				onStart(testInput=false) {
					if (testInput) {
						doReset("m", true);
						player.h.activeChallenge = 42;
						updateTemp();
						updateTemp();
						updateTemp();
					}
				},
			},
		},
})
/*
                    
                    
                    
                    
                    
                    
   qqqqqqqqq   qqqqq
  q:::::::::qqq::::q
 q:::::::::::::::::q
q::::::qqqqq::::::qq
q:::::q     q:::::q 
q:::::q     q:::::q 
q:::::q     q:::::q 
q::::::q    q:::::q 
q:::::::qqqqq:::::q 
 q::::::::::::::::q 
  qq::::::::::::::q 
    qqqqqqqq::::::q 
            q:::::q 
            q:::::q 
           q:::::::q
           q:::::::q
           q:::::::q
           qqqqqqqqq
                    
*/
addLayer("q", {
        name: "quirks", // This is optional, only used in a few places, If absent it just uses the layer id.
        symbol: "Q", // This appears on the layer's node. Default is the id with the first letter capitalized
        position: 2, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
        startData() { return {
            unlocked: false,
			points: new Decimal(0),
			best: new Decimal(0),
			total: new Decimal(0),
			energy: new Decimal(0),
			time: new Decimal(0),
			auto: false,
			first: 0,
			pseudoUpgs: [],
        }},
        color: "#c20282",
        requires: new Decimal("1e512"), // Can be a function that takes requirement increases into account
        resource: "诡异", // Name of prestige currency
        baseResource: "GP", // Name of resource prestige is based on
        baseAmount() {return player.g.power}, // Get the current amount of baseResource
        type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
        exponent() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?.008:.0075) }, // Prestige currency exponent
        gainMult() { // Calculate the multiplier for main currency from bonuses
            mult = new Decimal(1)
			if (hasUpgrade("q", 14)) mult = mult.times(upgradeEffect("q", 14).q);
			mult = mult.times(improvementEffect("q", 33));
			if (player.m.unlocked) mult = mult.times(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes("m"):false)?tmp.m.mainHexEff:tmp.m.hexEff);
			if (hasUpgrade("ba", 22)) mult = mult.times(tmp.ba.negBuff);
			if (hasUpgrade("hn", 43)) mult = mult.times(upgradeEffect("hn", 43));
            return mult
        },
        gainExp() { // Calculate the exponent on main currency from bonuses
            return new Decimal(1)
        },
        row: 3, // Row the layer is in on the tree (0 is the first row)
        hotkeys: [
            {key: "q", description: "按 Q 进行诡异重置。", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
        ],
        doReset(resettingLayer){ 
			let keep = [];
			player.q.time = new Decimal(0);
			player.q.energy = new Decimal(0);
			if (hasMilestone("ba", 0)) keep.push("upgrades");
			if (layers[resettingLayer].row > this.row) layerDataReset(this.layer, keep)
        },
        layerShown(){return player.e.unlocked},
        branches: ["e"],
		enGainMult() {
			let mult = new Decimal(1);
			if (hasUpgrade("q", 11)) mult = mult.times(upgradeEffect("q", 11));
			if (hasUpgrade("q", 21)) mult = mult.times(upgradeEffect("q", 21));
			if (player.o.unlocked) mult = mult.times(buyableEffect("o", 12));
			if (player.ba.unlocked) mult = mult.times(tmp.ba.negBuff);
			return mult;
		},
		enGainExp() {
			let exp = player.q.buyables[11].plus(tmp.q.freeLayers).sub(1);
			return exp;
		},
		enEff() {
			if (!unl(this.layer)) return new Decimal(1);
			let eff = player.q.energy.plus(1).pow(2);
			if (hasUpgrade("q", 23)) eff = eff.pow(3);
			return softcap("qe", eff.times(improvementEffect("q", 23)));
		},
		update(diff) {
			player.q.time = player.q.time.plus(diff);
			if (tmp.q.enGainExp.gte(0)) player.q.energy = player.q.energy.plus(player.q.time.times(tmp.q.enGainMult).pow(tmp.q.enGainExp).times(diff));
			if (hasMilestone("ba", 1) && player.q.auto && player.ma.current!="q") layers.q.buyables[11].buyMax();
		},
		passiveGeneration() { return (hasMilestone("ba", 0)&&player.ma.current!="q")?1:0 },
		tabFormat: {
			"Main Tab": {
				content: [
					"main-display",
					"prestige-button",
					"blank",
					["display-text",
						function() {return '你有 ' + formatWhole(player.g.power)+' GP'},
							{}],
					["display-text",
						function() {return '你最多拥有 ' + formatWhole(player.q.best)+' 诡异'},
							{}],
					["display-text",
						function() {return '你总共拥有 ' + formatWhole(player.q.total)+' 诡异'},
							{}],
					"blank",
					["display-text",
						function() {return '你有 ' + formatWhole(player.q.energy)+' QE ('+(tmp.nerdMode?('基础获取: (timeInRun^(quirkLayers-1))'):'由诡异层生成')+')，增幅点数和 GP 获取 ' + format(tmp.q.enEff)+(tmp.nerdMode?(" ((x+1)^"+format(hasUpgrade("q", 23)?6:2)+"*"+format(improvementEffect("q", 23))+")"):"")},
							{}],
					"blank",
					"milestones", "blank",
					"blank",
					"buyables", "blank",
					["display-text", "注意: 大部分诡异升级随时间变贵，但在执行诡异重置时恢复。"], "blank",
					"upgrades"],
			},
			Improvements: {
				unlocked() { return hasUpgrade("q", 41) },
				buttonStyle() { return {'background-color': '#f25ed7'} },
				content: [
					"main-display",
					"blank",
					["display-text",
						function() {return '你有 ' + formatWhole(player.q.energy)+' QE ('+(tmp.nerdMode?('基础获取: (timeInRun^(quirkLayers-1))'):'由诡异层生成')+'), 提供了下列诡异改良 (下一个需要 '+format(tmp.q.impr.overallNextImpr)+')'},
							{}],
					"blank",
					"improvements"],
			},
		},
		freeLayers() {
			let l = new Decimal(0);
			if (player.m.unlocked) l = l.plus(tmp.m.buyables[13].effect);
			if (tmp.q.impr[43].unlocked) l = l.plus(improvementEffect("q", 43));
			if (player.i.buyables[11].gte(3)) l = l.plus(buyableEffect("s", 18));
			return l;
		},
		buyables: {
			rows: 1,
			cols: 1,
			11: {
				title: "诡异层",
				costBase() {
					let base = new Decimal(2);
					if (hasUpgrade("q", 43)) base = base.sub(.25);
					if (hasChallenge("h", 42)) base = base.sub(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes("h"):false)?.2:.15);
					if (hasAchievement("a", 101)) base = base.sub(.2);
					if (hasUpgrade("q", 25) && player.i.buyables[12].gte(6)) base = base.root(upgradeEffect("q", 25));
					if ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false) base = base.pow(.75);
					return base;
				},
				cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
					let base = this.costBase();
                    let cost = Decimal.pow(base, Decimal.pow(base, x).sub(1));
                    return cost.floor()
                },
				display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    let display = (tmp.nerdMode?("价格公式: "+format(data.costBase)+"^("+format(data.costBase)+"^x-1)"):("价格: " + formatWhole(data.cost) + " 诡异")+"\n\
                    数量: " + formatWhole(player[this.layer].buyables[this.id])+(tmp.q.freeLayers?(tmp.q.freeLayers.gt(0)?(" + "+format(tmp.q.freeLayers)):""):""))
					return display;
                },
                unlocked() { return player[this.layer].unlocked }, 
                canAfford() {
                    return player.q.points.gte(tmp[this.layer].buyables[this.id].cost)},
                buy() { 
                    cost = tmp[this.layer].buyables[this.id].cost
                    player.q.points = player.q.points.sub(cost)	
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                },
                buyMax() {
					if (!this.unlocked || !this.canAfford()) return;
					let base = this.costBase();
					let target = player.q.points.max(1).log(base).plus(1).log(base);
					target = target.plus(1).floor();
					player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].max(target);
				},
                style: {'height':'222px'},
				autoed() { return hasMilestone("ba", 1) && player.q.auto },
			},
		},
		milestones: {
			0: {
				requirementDescription: "2 总诡异",
				done() { return player.q.total.gte(2) || hasAchievement("a", 71) },
				effectDescription: "对任何重置保留增幅器、生成器、空间和时间里程碑。",
			},
			1: {
				requirementDescription: "3 总诡异",
				done() { return player.q.total.gte(3) || hasAchievement("a", 71) },
				effectDescription: "你可以最大购买时间和空间，每秒获得 100% 增强，并解锁自动增强子和自动扩展时空胶囊。",
				toggles: [["e", "auto"], ["t", "autoExt"]],
			},
			2: {
				requirementDescription: "4 总诡异",
				done() { return player.q.total.gte(4) || hasAchievement("a", 71) },
				effectDescription: "对任何重置保留空间、增强和时间升级，同时在诡异/障碍重置中保留建筑。",
			},
			3: {
				requirementDescription: "6 总诡异",
				done() { return player.q.total.gte(6) || hasAchievement("a", 71) },
				effectDescription: "解锁自动时间胶囊和自动空间能量。",
				toggles: [["t", "auto"], ["s", "auto"]],
			},
			4: {
				requirementDescription: "10 总诡异",
				done() { return player.q.total.gte(10) || hasAchievement("a", 71) },
				effectDescription: "解锁障碍和自动超级增幅器。",
				toggles: [["sb", "auto"]],
			},
			5: {
				requirementDescription: "25 总诡异",
				done() { return player.q.total.gte(25) || hasAchievement("a", 71) },
				effectDescription: "时间、空间和超级增幅器不再重置任何东西，同时你可以摧毁建筑。",
			},
			6: {
				unlocked() { return player.sg.unlocked },
				requirementDescription: "1e22 总诡异",
				done() { return player.q.total.gte(1e22) || hasAchievement("a", 71) },
				effectDescription: "解锁自动超级生成器，并且超级生成器不再重置任何东西。",
				toggles: [["sg", "auto"]],
			},
			7: {
				unlocked() { return player.sg.unlocked },
				requirementDescription: "1e60 总诡异",
				done() { return player.q.total.gte(1e60) || hasAchievement("a", 71) },
				effectDescription: "你可以最大购买超级增幅器和超级生成器，同时解锁自动建筑。",
				toggles: [["s", "autoBld"]],
			},
		},
		upgrades: {
			rows: 4,
			cols: 5,
			11: {
				title: "集中诡异",
				description: "总诡异加成诡异层生产（由诡异升级数量求幂）。",
				cost() { return player.q.time.plus(1).pow(1.2).times(100).pow(player.ma.current=="q"?this.id:1) },
				costFormula: "100*(time+1)^1.2",
				currencyDisplayName: "QE",
				currencyInternalName: "energy",
				currencyLayer: "q",
				unlocked() { return hasChallenge("h", 11)||((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes("q"):false) },
				effect() { return player.q.total.plus(1).log10().plus(1).pow(player.q.upgrades.length).pow(improvementEffect("q", 11)) },
				effectDisplay() { return format(tmp.q.upgrades[11].effect)+"x" },
				formula: "(log(quirks+1)+1)^upgrades",
			},
			12: {
				title: "回到第 2 层",
				description: "总诡异加成增幅器/生成器底数。",
				cost() { return player.q.time.plus(1).pow(1.4).times(500).pow(player.ma.current=="q"?(Math.pow(this.id, this.id/10)*(this.id-10)):1) },
				costFormula: "500*(time+1)^1.4",
				currencyDisplayName: "QE",
				currencyInternalName: "energy",
				currencyLayer: "q",
				unlocked() { return hasUpgrade("q", 11) },
				effect() { return player.q.total.plus(1).log10().plus(1).pow(1.25).times(improvementEffect("q", 12)) },
				effectDisplay() { return format(tmp.q.upgrades[12].effect)+"x" },
				formula: "(log(x+1)+1)^1.25",
			},
			13: {
				title: "跳过跳过第二个",
				description: "GP 效果提升至 1.25 次幂。",
				cost() { return player.q.time.plus(1).pow(1.8).times(750).pow(player.ma.current=="q"?(Math.pow(this.id, this.id/10)*(this.id-10)):1) },
				costFormula: "750*(time+1)^1.8",
				currencyDisplayName: "QE",
				currencyInternalName: "energy",
				currencyLayer: "q",
				unlocked() { return hasUpgrade("q", 11) },
			},
			14: {
				title: "第 4 列协同",
				description: "障碍灵魂和诡异加成对方获取。",
				cost() { return player.q.time.plus(1).pow(2.4).times(1e6).pow(player.ma.current=="q"?(this.id*6):1) },
				costFormula: "1e6*(time+1)^2.4",
				currencyDisplayName: "QE",
				currencyInternalName: "energy",
				currencyLayer: "q",
				unlocked() { return hasUpgrade("q", 12)||hasUpgrade("q", 13) },
				effect() { 
					let q = player.q.points;
					let h = player.h.points;
					h = softcap("q14_h", h);
					q = softcap("q14_q", q);
					return {
						h: q.plus(1).cbrt().pow(improvementEffect("q", 13)),
						q: h.plus(1).root(4).pow(improvementEffect("q", 13)),
					};
				},
				effectDisplay() { return "H: "+format(tmp.q.upgrades[14].effect.h)+"x, Q: "+format(tmp.q.upgrades[14].effect.q)+"x" },
				formula() { return "H: "+(player.q.points.gte("1e1100")?"log(cbrt(Q+1))^366.67":"cbrt(Q+1)")+", Q: "+(player.h.points.gte("1e1000")?"log(H+1)^83.33":"(H+1)^0.25") },
			},
			15: {
				title: "诡异拓展",
				description: "诡异延缓 QE 效果软上限。",
				cost() { return Decimal.pow("e1e6", player.q.time.times(10).plus(1).log10().pow(2)).times("e1.5e7") },
				costFormula: "(e1,000,000^(log(time*10+1)^2))*e15,000,000",
				currencyDisplayName: "QE",
				currencyInternalName: "energy",
				currencyLayer: "q",
				pseudoUnl() { return player.i.buyables[12].gte(6) },
				pseudoReq: "需要: 40 成就",
				pseudoCan() { return player.a.achievements.length>=40 },
				unlocked() { return player[this.layer].pseudoUpgs.includes(Number(this.id)) },
				effect() { return player.q.points.plus(1) },
				effectDisplay() { return "延缓 " + format(tmp.q.upgrades[this.id].effect)+"x" },
				formula: "x+1",
			},
			21: {
				title: "诡异城市",
				description: "超级增幅器加成诡异层生产。",
				cost() { return player.q.time.plus(1).pow(3.2).times(1e8).pow(player.ma.current=="q"?(this.id*1.5):1) },
				costFormula: "1e8*(time+1)^3.2",
				currencyDisplayName: "QE",
				currencyInternalName: "energy",
				currencyLayer: "q",
				unlocked() { return hasUpgrade("q", 11)&&hasUpgrade("q", 13) },
				effect() { return Decimal.pow(1.25, player.sb.points).pow(improvementEffect("q", 21)) },
				effectDisplay() { return format(tmp.q.upgrades[21].effect)+"x" },
				formula: "1.25^x",
			},
			22: {
				title: "无限可能",
				description: "总诡异提供免费的扩展时间胶囊、增强子和建筑。",
				cost() { return player.q.time.plus(1).pow(4.2).times(2e11).pow(player.ma.current=="q"?(this.id*2):1) },
				costFormula: "2e11*(time+1)^4.2",
				currencyDisplayName: "QE",
				currencyInternalName: "energy",
				currencyLayer: "q",
				unlocked() { return hasUpgrade("q", 12)&&hasUpgrade("q", 14) },
				effect() { return player.q.total.plus(1).log10().sqrt().times(improvementEffect("q", 22)).floor() },
				effectDisplay() { return "+"+formatWhole(tmp.q.upgrades[22].effect) },
				formula: "floor(sqrt(log(x+1)))",
			},
			23: {
				title: "挂机游戏",
				description: "QE 效果变为三次方。",
				cost() { return player.q.time.plus(1).pow(5.4).times(5e19).pow(player.ma.current=="q"?this.id:1) },
				costFormula: "5e19*(time+1)^5.4",
				currencyDisplayName: "QE",
				currencyInternalName: "energy",
				currencyLayer: "q",
				unlocked() { return hasUpgrade("q", 13)&&hasUpgrade("q", 21) },
			},
			24: {
				title: "指数狂怒",
				description: "TE 的第一个效果和增强子的第一个效果被提升到 7.5 次幂。",
				cost() { return player.q.time.plus(1).pow(6.8).times(1e24).pow(player.ma.current=="q"?(this.id*1.95):1) },
				costFormula: "1e24*(time+1)^6.8",
				currencyDisplayName: "QE",
				currencyInternalName: "energy",
				currencyLayer: "q",
				unlocked() { return hasUpgrade("q", 14)&&hasUpgrade("q", 22) },
			},
			25: {
				title: "高级洋葱",
				description: "星云砖降低诡异层价格底数。",
				cost() { return Decimal.pow("e3e6", player.q.time.times(4).plus(1).log10().pow(2)).times("e2e7") },
				costFormula: "(e3,000,000^(log(time*4+1)^2))*e20,000,000",
				currencyDisplayName: "QE",
				currencyInternalName: "energy",
				currencyLayer: "q",
				pseudoUnl() { return player.i.buyables[12].gte(6) },
				pseudoReq: "需要: 1e200 荣耀",
				pseudoCan() { return player.hn.points.gte(1e200) },
				unlocked() { return player[this.layer].pseudoUpgs.includes(Number(this.id)) },
				effect() { return player.i.nb.plus(1).log10().plus(1).pow(3) },
				effectDisplay() { return "开 "+format(upgradeEffect("q", 25))+" 次根" },
				formula: "(log(x+1)+1)^3",
			},
			31: {
				title: "比例软化",
				description: "基于诡异层，从 12 延缓 2/3 静态比例的软上限。",
				cost() { return player.q.time.plus(1).pow(8.4).times(1e48).pow(player.ma.current=="q"?(this.id/1.25):1) },
				costFormula: "1e48*(time+1)^8.4",
				currencyDisplayName: "QE",
				currencyInternalName: "energy",
				currencyLayer: "q",
				unlocked() { return hasUpgrade("q", 21)&&hasUpgrade("q", 23) },
				effect() { return player.q.buyables[11].sqrt().times(0.4).times(improvementEffect("q", 31)) },
				effectDisplay() { return "+"+format(tmp.q.upgrades[31].effect) },
				formula: "sqrt(x)*0.4",
			},
			32: {
				title: "超级第五空间",
				description: "第五建筑的效果翻倍。",
				cost() { return player.q.time.plus(1).pow(10).times(1e58).pow(player.ma.current=="q"?(this.id/1.6):1) },
				costFormula: "1e58*(time+1)^10",
				currencyDisplayName: "QE",
				currencyInternalName: "energy",
				currencyLayer: "q",
				unlocked() { return hasUpgrade("q", 22)&&hasUpgrade("q", 24) },
			},
			33: {
				title: "生成级数",
				description: "解锁超级生成器",
				cost() { return player.q.time.plus(1).pow(12).times(1e81).pow(player.ma.current=="q"?(this.id/1.85):1) },
				costFormula: "1e81*(time+1)^12",
				currencyDisplayName: "QE",
				currencyInternalName: "energy",
				currencyLayer: "q",
				unlocked() { return hasUpgrade("q", 23)&&hasUpgrade("q", 31) },
			},
			34: {
				title: "增幅狂怒",
				description: "任何增加增幅器底数的东西都会以较低的比例对其做乘法。",
				cost() { return player.q.time.plus(1).pow(15).times(2.5e94).pow(player.ma.current=="q"?(this.id/1.85):1) },
				costFormula: "2.5e94*(time+1)^15",
				currencyDisplayName: "QE",
				currencyInternalName: "energy",
				currencyLayer: "q",
				unlocked() { return hasUpgrade("q", 24)&&hasUpgrade("q", 32) },
				effect() { return tmp.b.addToBase.plus(1).root(2.5).times(improvementEffect("q", 32)) },
				effectDisplay() { return format(tmp.q.upgrades[34].effect)+"x" },
				formula: "(x+1)^0.4",
			},
			35: {
				title: "千种能力",
				description: "超空间砖减缓诡异改良价格比例。",
				cost() { return Decimal.pow("e2e6", player.q.time.times(4).plus(1).log10().pow(3)).times("e3.5e7") },
				costFormula: "(e2,000,000^(log(time*4+1)^3))*e35,000,000",
				currencyDisplayName: "QE",
				currencyInternalName: "energy",
				currencyLayer: "q",
				pseudoUnl() { return player.i.buyables[12].gte(6) },
				pseudoReq: "需要: 无诡异层达到 e5,000,000 QE（使用第五行重置）。",
				pseudoCan() { return player.q.energy.gte("e5e6") && player.q.buyables[11].eq(0) },
				unlocked() { return player[this.layer].pseudoUpgs.includes(Number(this.id)) },
				effect() { return player.i.hb.sqrt().div(25).times(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?1.5:1).plus(1) },
				effectDisplay() { return "延缓 " + format(upgradeEffect("q", 35).sub(1).times(100))+"%" },
				formula: "sqrt(x)*4%",
			},
			41: {
				title: "离谱",
				description: "解锁诡异改良",
				cost() { return new Decimal((player.ma.current=="q")?"1e2325":1e125) },
				currencyDisplayName: "QE",
				currencyInternalName: "energy",
				currencyLayer: "q",
				unlocked() { return hasUpgrade("q", 33) && hasUpgrade("q", 34) },
			},
			42: {
				title: "改良增益",
				description: "解锁 3 个诡异改良。",
				cost() { return new Decimal((player.ma.current=="q")?"1e3675":1e150) },
				currencyDisplayName: "QE",
				currencyInternalName: "energy",
				currencyLayer: "q",
				unlocked() { return hasUpgrade("q", 41) },
			},
			43: {
				title: "更多层",
				description: "诡异层价格增长减缓 25%。",
				cost() { return new Decimal((player.ma.current=="q")?"1e5340":1e175) },
				currencyDisplayName: "QE",
				currencyInternalName: "energy",
				currencyLayer: "q",
				unlocked() { return hasUpgrade("q", 42) },
			},
			44: {
				title: "大量改良",
				description: "解锁 3 个诡异改良。",
				cost() { return new Decimal((player.ma.current=="q")?"1e8725":1e290) },
				currencyDisplayName: "QE",
				currencyInternalName: "energy",
				currencyLayer: "q",
				unlocked() { return hasUpgrade("q", 43) },
			},
			45: {
				title: "反障碍",
				description: "障碍灵魂效果提升至 100 次幂（在软上限后），星云获取增幅 200 倍。",
				cost: new Decimal("e55555555"),
				currencyDisplayName: "QE",
				currencyInternalName: "energy",
				currencyLayer: "q",
				pseudoUnl() { return player.i.buyables[12].gte(6) },
				pseudoReq: "需要: e1.7e10 声望",
				pseudoCan() { return player.p.points.gte("e1.7e10") },
				unlocked() { return player[this.layer].pseudoUpgs.includes(Number(this.id)) },
			},
		},
		impr: {
			scaleSlow() {
				let slow = new Decimal(1);
				if (tmp.ps.impr[22].unlocked) slow = slow.times(tmp.ps.impr[22].effect);
				if (hasUpgrade("q", 35) && player.i.buyables[12].gte(6)) slow = slow.times(upgradeEffect("q", 35));
				return slow;
			},
			baseReq() { 
				let req = new Decimal(1e128);
				if (player.ps.unlocked) req = req.div(tmp.ps.soulEff);
				return req;
			},
			amount() { 
				let amt = player.q.energy.div(this.baseReq()).plus(1).log10().div(2).root(layers.q.impr.scaleSlow().pow(-1).plus(1)).max(0);
				if (amt.gte(270)) amt = amt.log10().times(270/Math.log10(270));
				return amt.floor();
			},
			overallNextImpr() { 
				let impr = tmp.q.impr.amount.plus(1);
				if (impr.gte(270)) impr = Decimal.pow(10, impr.div(270/Math.log10(270)));
				return Decimal.pow(10, impr.pow(layers.q.impr.scaleSlow().pow(-1).plus(1)).times(2)).sub(1).times(this.baseReq()) 
			},
			nextAt(id=11) { 
				let impr = getImprovements("q", id).times(tmp.q.impr.activeRows*tmp.q.impr.activeCols).add(tmp.q.impr[id].num);
				if (impr.gte(270)) impr = Decimal.pow(10, impr.div(270/Math.log10(270)));
				return Decimal.pow(10, impr.pow(layers.q.impr.scaleSlow().pow(-1).plus(1)).times(2)).sub(1).times(this.baseReq());
			},
			free() {
				let free = new Decimal(0);
				if ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes('q'):false) free = free.plus(Decimal.div(player.s.buyables[20]||0, 4));
				return free.floor();
			},
			resName: "QE",
			rows: 4,
			cols: 3,
			activeRows: 3,
			activeCols: 3,
			11: {
				num: 1,
				title: "集中改良",
				description: "<b>集中诡异</b> 效果提高。",
				unlocked() { return hasUpgrade("q", 41) },
				effect() { return Decimal.mul(0.1, getImprovements("q", 11).plus(tmp.q.impr.free)).plus(1) },
				effectDisplay() { return "^"+format(tmp.q.impr[11].effect) },
				formula: "1+0.1*x",
			},
			12: {
				num: 2,
				title: "第二改良",
				description: "<b>回到第 2 层</b> 效果提高。",
				unlocked() { return hasUpgrade("q", 41) },
				effect() { return Decimal.mul(0.05, getImprovements("q", 12).plus(tmp.q.impr.free)).plus(1) },
				effectDisplay() { return format(tmp.q.impr[12].effect)+"x" },
				formula: "1+0.05*x",
			},
			13: {
				num: 3,
				title: "4 级改良",
				description: "<b>第 4 列协同</b> 效果提高。",
				unlocked() { return hasUpgrade("q", 41) },
				effect() { return Decimal.mul(0.25, getImprovements("q", 13).plus(tmp.q.impr.free)).plus(1) },
				effectDisplay() { return "^"+format(tmp.q.impr[13].effect) },
				formula: "1+0.25*x",
			},
			21: {
				num: 4,
				title: "发展改良",
				description: "<b>诡异城市</b> 效果提高。",
				unlocked() { return hasUpgrade("q", 42) },
				effect() { return Decimal.mul(1.5, getImprovements("q", 21).plus(tmp.q.impr.free)).plus(1) },
				effectDisplay() { return "^"+format(tmp.q.impr[21].effect) },
				formula: "1+1.5*x",
			},
			22: {
				num: 5,
				title: "离谱改良",
				description: "<b>无限可能</b> 效果提高。",
				unlocked() { return hasUpgrade("q", 42) },
				effect() { return Decimal.mul(0.2, getImprovements("q", 22).plus(tmp.q.impr.free)).plus(1) },
				effectDisplay() { return format(tmp.q.impr[22].effect)+"x" },
				formula: "1+0.2*x",
			},
			23: {
				num: 6,
				title: "能量改良",
				description: "QE 效果提高。",
				unlocked() { return hasUpgrade("q", 42) },
				effect() { return Decimal.pow(1e25, Decimal.pow(getImprovements("q", 23).plus(tmp.q.impr.free), 1.5)) },
				effectDisplay() { return format(tmp.q.impr[23].effect)+"x" },
				formula: "1e25^(x^1.5)",
			},
			31: {
				num: 7,
				title: "比例改良",
				description: "<b>比例软化</b> 效果提高。",
				unlocked() { return hasUpgrade("q", 44) },
				effect() { return Decimal.mul(0.5, getImprovements("q", 31).plus(tmp.q.impr.free)).plus(1) },
				effectDisplay() { return format(tmp.q.impr[31].effect)+"x" },
				formula: "1+0.5*x",
			},
			32: {
				num: 8,
				title: "增幅改良",
				description: "<b>增幅狂怒</b> 效果提高。",
				unlocked() { return hasUpgrade("q", 44) },
				effect() { return Decimal.mul(0.2, getImprovements("q", 32).plus(tmp.q.impr.free)).plus(1) },
				effectDisplay() { return format(tmp.q.impr[32].effect)+"x" },
				formula: "1+0.2*x",
			},
			33: {
				num: 9,
				title: "诡异改良",
				description: "诡异获取提高。",
				unlocked() { return hasUpgrade("q", 44) },
				effect() { return Decimal.pow(1e8, Decimal.pow(getImprovements("q", 33).plus(tmp.q.impr.free), 1.2)) },
				effectDisplay() { return format(tmp.q.impr[33].effect)+"x" },
				formula: "1e8^(x^1.2)",
			},
			41: {
				num: 271,
				title: "阳光改良",
				description: "SE 获取增强。",
				unlocked() { return (tmp.ps.buyables[11].effects.quirkImpr||0)>=1 },
				effect() { return Decimal.pow("1e400", Decimal.pow(getImprovements("q", 41).plus(tmp.q.impr.free), 0.9)) },
				effectDisplay() { return format(tmp.q.impr[41].effect)+"x" },
				formula: "1e400^(x^0.9)",
			},
			42: {
				num: 281,
				title: "子空间改良",
				description: "子空间底数提高。",
				unlocked() { return (tmp.ps.buyables[11].effects.quirkImpr||0)>=2 },
				effect() { return Decimal.pow(10, Decimal.pow(getImprovements("q", 42).plus(tmp.q.impr.free), 0.75)) },
				effectDisplay() { return format(tmp.q.impr[42].effect)+"x" },
				formula: "10^(x^0.75)",
			},
			43: {
				num: 301,
				title: "层改良",
				description: "增加免费诡异层。",
				unlocked() { return (tmp.ps.buyables[11].effects.quirkImpr||0)>=3 },
				effect() { return Decimal.mul(Decimal.pow(getImprovements("q", 43).plus(tmp.q.impr.free), 0.8), 1.25) },
				effectDisplay() { return "+"+format(tmp.q.impr[43].effect) },
				formula: "1.25*(x^0.8)",
			},
		},
})
/*
                 
                 
                 
                 
                 
                 
   ooooooooooo   
 oo:::::::::::oo 
o:::::::::::::::o
o:::::ooooo:::::o
o::::o     o::::o
o::::o     o::::o
o::::o     o::::o
o::::o     o::::o
o:::::ooooo:::::o
o:::::::::::::::o
 oo:::::::::::oo 
   ooooooooooo   
                 
                 
                 
                 
                 
                 
                 
*/
addLayer("o", {
	name: "solarity", // This is optional, only used in a few places, If absent it just uses the layer id.
        symbol: "huh", // This appears on the layer's node. Default is the id with the first letter capitalized
        position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
        startData() { return {
            unlocked: false,
			points: new Decimal(0),
			best: new Decimal(0),
			total: new Decimal(0),
			energy: new Decimal(0),
			first: 0,
        }},
		increaseUnlockOrder: ["ss"],
		roundUpCost: true,
        color: "#ffcd00",
		nodeStyle() {return {
			"background": (((player.o.unlocked||canReset("o"))&&!(Array.isArray(tmp.ma.canBeMastered)&&player.ma.selectionActive&&tmp[this.layer].row<tmp.ma.rowLimit&&!tmp.ma.canBeMastered.includes(this.layer))))?((player.grad&&!player.oldStyle)?"radial-gradient(#ffcd00, #ff4300)":"#ff8200"):"#bf8f8f" ,
        }},
		componentStyles: {
			"prestige-button"() {return { "background": (canReset("o"))?((player.grad&&!player.oldStyle)?"radial-gradient(#ffcd00, #ff4300)":"#ff8200"):"#bf8f8f" }},
		},
        requires() { 
			let req = new Decimal((player[this.layer].unlockOrder>0&&!hasAchievement("a", 62))?16:14).sub(tmp.o.solEnEff);
			if (hasUpgrade("ba", 23)) req = req.div(tmp.ba.posBuff.max(1));
			return req;
		},
        resource: "阳光", // Name of prestige currency
        baseResource: "超级增幅器", // Name of resource prestige is based on
        baseAmount() {return player.sb.points}, // Get the current amount of baseResource
        type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
        exponent() { 
			let exp = new Decimal(10);
			if (hasUpgrade("p", 34)) exp = exp.times(upgradeEffect("p", 34));
			if (hasUpgrade("hn", 25)) exp = exp.times(upgradeEffect("hn", 25));
			if (player.n.buyables[11].gte(4)) exp = exp.times(buyableEffect("o", 32));
			if ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false) exp = exp.times(player.sb.points.times(0.5/100).plus(1))
			if (player.en.unlocked) exp = exp.plus(tmp.en.owEff);
			return exp;
		}, // Prestige currency exponent
        gainMult() { // Calculate the multiplier for main currency from bonuses
            mult = buyableEffect("o", 11);
            return mult
        },
        gainExp() { // Calculate the exponent on main currency from bonuses
            return new Decimal(1);
        },
        row: 3, // Row the layer is in on the tree (0 is the first row)
        hotkeys: [
            {key: "o", description: "按 O 进行阳光重置。", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
        ],
        doReset(resettingLayer){ 
			let keep = [];
			player.q.time = new Decimal(0);
			player.q.energy = new Decimal(0);
			if (layers[resettingLayer].row > this.row) layerDataReset(this.layer, keep)
        },
        layerShown(){return (player.sb.unlocked&&player.h.unlocked)||player.m.unlocked||player.ba.unlocked },
        branches: ["sb", "t"],
		effect() { 
			if (!unl(this.layer)) return new Decimal(0);
			let sol = player.o.points;
			sol = softcap("sol_eff", sol);
			let eff = sol.plus(1).log10();
			let cap = 0.1;
			if ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false) cap = 0.15;
			if (eff.gt(10)) eff = eff.log10().times(3).plus(7)
			return eff.div(100).min(cap);
		},
		effect2() { return player.o.points.div(1e20).plus(1).sqrt().pow(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?1.1:1) },
		solEnGain() { 
			let gain = player.t.energy.max(1).pow(tmp.o.effect).times(tmp.o.effect2).sub(1);
			if (player.m.unlocked) gain = gain.times(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes("m"):false)?tmp.m.mainHexEff:tmp.m.hexEff);
			if (tmp.q.impr[41].unlocked) gain = gain.times(improvementEffect("q", 41));
			return gain;
		},
		solEnEff() { return Decimal.sub(4, Decimal.div(4, player.o.energy.plus(1).log10().plus(1))) },
		solEnEff2() { return player.o.energy.plus(1).pow(2) },
		effectDescription() { return "生成  "+(tmp.nerdMode?("(timeEnergy^"+format(tmp.o.effect)+(tmp.o.effect.gt(1.01)?("*"+format(tmp.o.effect2)):"")+"-1)"):format(tmp.o.solEnGain))+" SE/sec" },
		update(diff) {
			player.o.energy = player.o.energy.plus(tmp.o.solEnGain.times(diff));
			if (hasMilestone("m", 0) && player.ma.current!="o") {
				for (let i in tmp.o.buyables) if (i!="rows" && i!="cols") if (tmp.o.buyables[i].unlocked) player.o.buyables[i] = player.o.buyables[i].plus(tmp.o.buyables[i].gain.times(diff));
			}
		},
		passiveGeneration() { return player.ma.current=="o"?0:(hasMilestone("m", 0)?1:(hasMilestone("o", 0)?0.05:0)) },
		solPow() {
			let pow = new Decimal(1);
			if (hasUpgrade("ss", 33)) pow = pow.plus(upgradeEffect("ss", 33));
			if (hasUpgrade("ss", 41)) pow = pow.plus(buyableEffect("o", 21));
			if (hasUpgrade("ba", 11)) pow = pow.plus(upgradeEffect("ba", 11));
			if (hasUpgrade("hn", 55)) pow = pow.plus(upgradeEffect("hn", 55));
			if (player.n.buyables[11].gte(5)) pow = pow.plus(buyableEffect("o", 33));
			if (tmp.ps.impr[11].unlocked) pow = pow.times(tmp.ps.impr[11].effect);
			if ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false) pow = pow.plus(player.o.points.plus(1).log10().div(5));
			return softcap("solPow", pow);
		},
		tabFormat: ["main-display",
			"prestige-button",
			"resource-display",
			"blank",
			["display-text",
				function() {return '你有 ' + format(player.o.energy) + ' SE，减少阳光需求 '+format(tmp.o.solEnEff)+(tmp.nerdMode?(" (4-4/(log(x+1)+1))"):"")+' 并加成 TE 上限 '+format(tmp.o.solEnEff2)+'.'+(tmp.nerdMode?(" (x+1)^2"):"")},
					{}],
			"blank",
			"milestones",
			"blank",
			["display-text",
				function() { return "<b>太阳能: "+format(tmp.o.solPow.times(100))+"%</b><br>" },
					{}],
			"buyables",
			"blank"
		],
		multiplyBuyables() {
			let mult = tmp.n.dustEffs.orange;
			return mult;
		},
		buyableGainExp() {
			let exp = new Decimal(1);
			if ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false) exp = exp.times(2.6);
			return exp;
		},
		buyables: {
			rows: 3,
			cols: 3,
			11: {
				title: "太阳核心",
				gain() { return player.o.points.div(2).root(1.5).pow(tmp.o.buyableGainExp).floor() },
				effect() { 
					let amt = player[this.layer].buyables[this.id].times(tmp.o.multiplyBuyables)
					amt = softcap("solCores2", softcap("solCores", amt));
					return Decimal.pow(hasUpgrade("ss", 22)?(amt.plus(1).pow(tmp.o.solPow).cbrt()):(amt.plus(1).pow(tmp.o.solPow).log10().plus(1)), ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?1.1:1)
				},
				display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
					let x = player[this.layer].buyables[this.id].gte(5e4)?"10^(sqrt(log(x)*log(5e4)))":"x"
                    let display = ("献祭你所有的阳光，获得 "+formatWhole(tmp[this.layer].buyables[this.id].gain)+" 太阳核心\n"+
					"需要: 2 阳光\n"+
					"数量: " + formatWhole(player[this.layer].buyables[this.id])+((tmp.o.multiplyBuyables||new Decimal(1)).eq(1)?"":(" x "+format(tmp.o.multiplyBuyables))))+"\n"+
					(tmp.nerdMode?("公式: "+(hasUpgrade("ss", 22)?"cbrt("+x+"+1)":"log("+x+"+1)+1")+""):("效果: 加成阳光获取 "+format(tmp[this.layer].buyables[this.id].effect) + 'x'))
					return display;
                },
                unlocked() { return player[this.layer].unlocked }, 
                canAfford() { return player.o.points.gte(2) },
                buy() { 
                    player.o.points = new Decimal(0);
					player.o.buyables[this.id] = player.o.buyables[this.id].plus(tmp[this.layer].buyables[this.id].gain);
                },
                buyMax() {
					// I'll do this later ehehe
				},
                style: {'height':'140px', 'width':'140px'},
				autoed() { return hasMilestone("m", 0) },
			},
			12: {
				title: "差旋层电浆",
				gain() { return player.o.points.div(100).times(player.o.energy.div(2500)).root(3.5).pow(tmp.o.buyableGainExp).floor() },
				effect() { return Decimal.pow(hasUpgrade("p", 24)?Decimal.pow(10, player[this.layer].buyables[this.id].times(tmp.o.multiplyBuyables).plus(1).log10().cbrt()):(player[this.layer].buyables[this.id].times(tmp.o.multiplyBuyables).plus(1).pow(tmp.o.solPow).log10().plus(1).log10().times(10).plus(1)), ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?1.1:1) },
				display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    let display = ("献祭你所有的阳光和 SE，获得 "+formatWhole(tmp[this.layer].buyables[this.id].gain)+" 差旋层电浆\n"+
					"需要: 100 阳光、2,500 SE\n"+
					"数量: " + formatWhole(player[this.layer].buyables[this.id])+((tmp.o.multiplyBuyables||new Decimal(1)).eq(1)?"":(" x "+format(tmp.o.multiplyBuyables))))+"\n"+
					(tmp.nerdMode?("公式: "+(hasUpgrade("p", 24)?"10^cbrt(log(x+1))":"log(log(x+1)+1)*10+1")):("效果: 加成超级增幅器底数和诡异层 "+format(tmp[this.layer].buyables[this.id].effect) + 'x'))
					return display;
                },
                unlocked() { return player[this.layer].unlocked }, 
                canAfford() { return player.o.points.gte(100)&&player.o.energy.gte(2500) },
                buy() { 
                    player.o.points = new Decimal(0);
					player.o.energy = new Decimal(0);
					player.o.buyables[this.id] = player.o.buyables[this.id].plus(tmp[this.layer].buyables[this.id].gain);
                },
                buyMax() {
					// I'll do this later ehehe
				},
                style: {'height':'140px', 'width':'140px', 'font-size':'9px'},
				autoed() { return hasMilestone("m", 0) },
			},
			13: {
				title: "对流能",
				gain() { return player.o.points.div(1e3).times(player.o.energy.div(2e5)).times(player.ss.subspace.div(10)).root(6.5).pow(tmp.o.buyableGainExp).floor() },
				effect() { return player[this.layer].buyables[this.id].times(tmp.o.multiplyBuyables).plus(1).pow(tmp.o.solPow).log10().plus(1).pow(2.5).pow(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?27.5:1) },
				display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    let display = ("献祭所有阳光、SE 和子空间，获得 "+formatWhole(tmp[this.layer].buyables[this.id].gain)+" 对流能\n"+
					"需要: 1e3 阳光、2e5 SE 和 10 子空间\n"+
					"数量: " + formatWhole(player[this.layer].buyables[this.id])+((tmp.o.multiplyBuyables||new Decimal(1)).eq(1)?"":(" x "+format(tmp.o.multiplyBuyables))))+"\n"+
					(tmp.nerdMode?("公式: (log(x+1)+1)^2.5"):("效果: 加成时间胶囊底数和子空间获取 "+format(tmp[this.layer].buyables[this.id].effect) + 'x'))
					return display;
                },
                unlocked() { return player[this.layer].unlocked&&player.ss.unlocked }, 
                canAfford() { return player.o.points.gte(1e3)&&player.o.energy.gte(2e5)&&player.ss.subspace.gte(10) },
                buy() { 
                    player.o.points = new Decimal(0);
					player.o.energy = new Decimal(0);
					player.ss.subspace = new Decimal(0);
					player.o.buyables[this.id] = player.o.buyables[this.id].plus(tmp[this.layer].buyables[this.id].gain);
                },
                buyMax() {
					// I'll do this later ehehe
				},
                style: {'height':'140px', 'width':'140px', 'font-size':'9px'},
				autoed() { return hasMilestone("m", 0) },
			},
			21: {
				title: "日冕波动",
				gain() { return player.o.points.div(1e5).root(5).times(player.o.energy.div(1e30).root(30)).times(player.ss.subspace.div(1e8).root(8)).times(player.q.energy.div("1e675").root(675)).pow(tmp.o.buyableGainExp).floor() },
				effect() { 
					let eff = player[this.layer].buyables[this.id].times(tmp.o.multiplyBuyables).plus(1).pow(tmp.o.solPow).log10().plus(1).log10();
					eff = softcap("corona", eff);
					if (hasUpgrade("hn", 24)) eff = eff.times(2);
					if ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false) eff = eff.times(1.4);
					return eff;
				},
				display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    let display = ("献祭所有阳光、SE、子空间和 QE，获得 "+formatWhole(tmp[this.layer].buyables[this.id].gain)+" 日冕波动\n"+
					"需要: 1e5 阳光、1e30 SE、5e8 子空间和 1e675 QE\n"+
					"数量: " + formatWhole(player[this.layer].buyables[this.id])+((tmp.o.multiplyBuyables||new Decimal(1)).eq(1)?"":(" x "+format(tmp.o.multiplyBuyables))))+"\n"+
					(tmp.nerdMode?("公式: log(log(x+1)+1)"):("效果: 子空间底数+"+format(tmp[this.layer].buyables[this.id].effect)+"，太阳能+"+format(tmp[this.layer].buyables[this.id].effect.times(100))+"%"))
					return display;
                },
                unlocked() { return player[this.layer].unlocked&&hasUpgrade("ss", 41) }, 
                canAfford() { return player.o.points.gte(1e5)&&player.o.energy.gte(1e30)&&player.ss.subspace.gte(1e8)&&player.q.energy.gte("1e675") },
                buy() { 
                    player.o.points = new Decimal(0);
					player.o.energy = new Decimal(0);
					player.ss.subspace = new Decimal(0);
					player.q.energy = new Decimal(0);
					player.o.buyables[this.id] = player.o.buyables[this.id].plus(tmp[this.layer].buyables[this.id].gain);
                },
                buyMax() {
					// I'll do this later ehehe
				},
                style: {'height':'140px', 'width':'140px', 'font-size':'9px'},
				autoed() { return hasMilestone("m", 0) },
			},
			22: {
				title: "新星遗迹",
				gain() { return player.o.buyables[11].div(1e150).pow(3).pow(tmp.o.buyableGainExp).floor() },
				effect() {
					return player[this.layer].buyables[this.id].times(tmp.o.multiplyBuyables).plus(1).pow(tmp.o.solPow).log10().root(10).times(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?1.4:1).plus(1)
				},
				display() {
					let data = tmp[this.layer].buyables[this.id]
					return ("献祭所有太阳核心，获得 "+formatWhole(data.gain)+" 新星遗迹\n"+
					"需要: 1e150 太阳核心\n"+
					"数量: "+formatWhole(player[this.layer].buyables[this.id])+((tmp.o.multiplyBuyables||new Decimal(1)).eq(1)?"":(" x "+format(tmp.o.multiplyBuyables)))+"\n"+
					(tmp.nerdMode?("公式: (log(x+1)^0.1)+1"):("效果: 增幅荣耀获取（无视软上限）以及三种星尘获取 "+format(data.effect)+"x")))
				},
				unlocked() { return player.n.buyables[11].gte(1) },
				canAfford() { return player.o.buyables[11].gte(1e150) },
				buy() {
					player.o.buyables[11] = new Decimal(0);
					player.o.buyables[this.id] = player.o.buyables[this.id].plus(tmp[this.layer].buyables[this.id].gain);
				},
				 buyMax() {
					// I'll do this later ehehe
				},
                style: {'height':'140px', 'width':'140px', 'font-size':'9px'},
				autoed() { return hasMilestone("m", 0) },
			},
			23: {
				title: "核熔炉",
				gain() { return player.o.buyables[11].div(1e175).times(player.o.energy.div("1e2500").root(10)).pow(tmp.o.buyableGainExp).floor() },
				effect() {
					return player[this.layer].buyables[this.id].times(tmp.o.multiplyBuyables).plus(1).pow(tmp.o.solPow).log10().plus(1).log10().root(2.5).times(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?1.4:1)
				},
				display() {
					let data = tmp[this.layer].buyables[this.id]
					return ("献祭所有太阳核心和 SE，获得 "+formatWhole(data.gain)+" 核熔炉\n"+
					"需要: 1e175 太阳核心 & 1e2,500 SE\n"+
					"数量: "+formatWhole(player[this.layer].buyables[this.id])+((tmp.o.multiplyBuyables||new Decimal(1)).eq(1)?"":(" x "+format(tmp.o.multiplyBuyables)))+"\n"+
					(tmp.nerdMode?("公式: (log(log(x+1)+1)^0.4)*100"):("效果: 建筑增强 "+format(data.effect.times(100))+"%")))
				},
				unlocked() { return player.n.buyables[11].gte(2) },
				canAfford() { return player.o.buyables[11].gte(1e175)&&player.o.energy.gte("1e2500") },
				buy() {
					player.o.buyables[11] = new Decimal(0);
					player.o.energy = new Decimal(0);
					player.o.buyables[this.id] = player.o.buyables[this.id].plus(tmp[this.layer].buyables[this.id].gain);
				},
				 buyMax() {
					// I'll do this later ehehe
				},
                style: {'height':'140px', 'width':'140px', 'font-size':'9px'},
				autoed() { return hasMilestone("m", 0) },
			},
			31: {
				title: "蓝移耀斑",
				gain() { return player.o.points.div("1e400").pow(10).pow(tmp.o.buyableGainExp).floor() },
				effect() {
					return player[this.layer].buyables[this.id].times(tmp.o.multiplyBuyables).plus(1).pow(tmp.o.solPow).log10().plus(1).log10().root(5).div(10).times(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?1.9:1)
				},
				display() {
					let data = tmp[this.layer].buyables[this.id]
					return ("献祭所有阳光，获得 "+formatWhole(data.gain)+" 蓝移耀斑\n"+
					"需要: 1e400 阳光\n"+
					"数量: "+formatWhole(player[this.layer].buyables[this.id])+((tmp.o.multiplyBuyables||new Decimal(1)).eq(1)?"":(" x "+format(tmp.o.multiplyBuyables)))+"\n"+
					(tmp.nerdMode?("公式: (log(log(x+1)+1)^0.2)*10"):("效果: 魔法增强 "+format(data.effect.times(100))+"%")))
				},
				unlocked() { return player.n.buyables[11].gte(3) },
				canAfford() { return player.o.points.gte("1e400") },
				buy() {
					player.o.points = new Decimal(0);
					player.o.buyables[this.id] = player.o.buyables[this.id].plus(tmp[this.layer].buyables[this.id].gain);
				},
				 buyMax() {
					// I'll do this later ehehe
				},
                style: {'height':'140px', 'width':'140px', 'font-size':'9px'},
				autoed() { return hasMilestone("m", 0) },
			},
			32: {
				title: "燃气",
				gain() { return player.o.energy.div("1e200000").root(100).pow(tmp.o.buyableGainExp).floor() },
				effect() {
					return player[this.layer].buyables[this.id].times(tmp.o.multiplyBuyables).plus(1).pow(tmp.o.solPow).log10().plus(1).log10().plus(1).log10().div(1.6).times(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?1.9:1).plus(1)
				},
				display() {
					let data = tmp[this.layer].buyables[this.id]
					return ("献祭所有 SE，获得 "+formatWhole(data.gain)+" 燃气\n"+
					"需要: e200,000 SE\n"+
					"Amount: "+formatWhole(player[this.layer].buyables[this.id])+((tmp.o.multiplyBuyables||new Decimal(1)).eq(1)?"":(" x "+format(tmp.o.multiplyBuyables)))+"\n"+
					(tmp.nerdMode?("公式: log(log(log(x+1)+1)+1)/1.6+1"):("效果: 将阳光获取指数乘 "+format(data.effect)+"。")))
				},
				unlocked() { return player.n.buyables[11].gte(4) },
				canAfford() { return player.o.energy.gte("1e200000") },
				buy() {
					player.o.energy = new Decimal(0);
					player.o.buyables[this.id] = player.o.buyables[this.id].plus(tmp[this.layer].buyables[this.id].gain);
				},
				 buyMax() {
					// I'll do this later ehehe
				},
                style: {'height':'140px', 'width':'140px', 'font-size':'9px'},
				autoed() { return hasMilestone("m", 0) },
			},
			33: {
				title: "聚变原料",
				gain() { return player.o.points.div("1e500").pow(10).pow(tmp.o.buyableGainExp).floor() },
				effect() {
					return player[this.layer].buyables[this.id].times(tmp.o.multiplyBuyables).plus(1).pow(tmp.o.solPow).log10().plus(1).log10().plus(1).log10().div(3).times(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?1.9:1);
				},
				display() {
					let data = tmp[this.layer].buyables[this.id]
					return ("献祭所有阳光，获得 "+formatWhole(data.gain)+" 聚变原料\n"+
					"需要: 1e750 阳光\n"+
					"数量: "+formatWhole(player[this.layer].buyables[this.id])+((tmp.o.multiplyBuyables||new Decimal(1)).eq(1)?"":(" x "+format(tmp.o.multiplyBuyables)))+"\n"+
					(tmp.nerdMode?("公式: log(log(log(x+1)+1)+1)/3"):("效果: 太阳能、建筑增益、超建筑增益 +"+format(data.effect.times(100))+"%。")))
				},
				unlocked() { return player.n.buyables[11].gte(5) },
				canAfford() { return player.o.points.gte("1e750") },
				buy() {
					player.o.points = new Decimal(0);
					player.o.buyables[this.id] = player.o.buyables[this.id].plus(tmp[this.layer].buyables[this.id].gain);
				},
				 buyMax() {
					// I'll do this later ehehe
				},
                style: {'height':'140px', 'width':'140px', 'font-size':'9px'},
				autoed() { return hasMilestone("m", 0) },
			},
		},
		milestones: {
			0: {
				requirementDescription: "50,000 总阳光",
				done() { return player.o.total.gte(5e4) || hasAchievement("a", 71) },
				effectDescription: "每秒获得 5% 的阳光。",
			},
		},
})
/*
                                  
                                  
                                  
                                  
                                  
                                  
    ssssssssss       ssssssssss   
  ss::::::::::s    ss::::::::::s  
ss:::::::::::::s ss:::::::::::::s 
s::::::ssss:::::ss::::::ssss:::::s
 s:::::s  ssssss  s:::::s  ssssss 
   s::::::s         s::::::s      
      s::::::s         s::::::s   
ssssss   s:::::s ssssss   s:::::s 
s:::::ssss::::::ss:::::ssss::::::s
s::::::::::::::s s::::::::::::::s 
 s:::::::::::ss   s:::::::::::ss  
  sssssssssss      sssssssssss    
                                  
                                  
                                  
                                  
                                  
                                  
                                  
*/
addLayer("ss", {
        name: "subspace", // This is optional, only used in a few places, If absent it just uses the layer id.
        symbol: "S+", // This appears on the layer's node. Default is the id with the first letter capitalized
        position: 3, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
        startData() { return {
            unlocked: false,
			points: new Decimal(0),
			best: new Decimal(0),
			subspace: new Decimal(0),
			auto: false,
			first: 0,
        }},
        color: "#e8ffff",
        requires() { return new Decimal((player[this.layer].unlockOrder>0&&!hasAchievement("a", 62))?30:28) }, // Can be a function that takes requirement increases into account
		roundUpCost: true,
        resource: "子空间能量", // Name of prestige currency
        baseResource: "空间能量", // Name of resource prestige is based on
        baseAmount() {return player.s.points}, // Get the current amount of baseResource
        type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
        exponent() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?1.07:1.1) }, // Prestige currency exponent
		base() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?1.1:1.15) },
        gainMult() { // Calculate the multiplier for main currency from bonuses
            mult = new Decimal(1)
			if (player.ne.unlocked) mult = mult.div(tmp.ne.thoughtEff1);
            return mult
        },
        gainExp() { // Calculate the exponent on main currency from bonuses
            return new Decimal(1)
        },
		canBuyMax() { return hasMilestone("hn", 3) },
		effBase() {
			let base = new Decimal(2);
			if (hasUpgrade("ss", 32)) base = base.plus(upgradeEffect("ss", 32));
			if (hasUpgrade("ss", 41)) base = base.plus(buyableEffect("o", 21));
			if (hasUpgrade("e", 31) && player.i.buyables[12].gte(3)) base = base.plus(buyableEffect("e", 11).second);
			
			if (player.ba.unlocked) base = base.times(tmp.ba.posBuff);
			if (tmp.q.impr[42].unlocked) base = base.times(improvementEffect("q", 42));
			if (hasUpgrade("hn", 35)) base = base.times(upgradeEffect("hn", 35));
			if ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false) base = base.times(Decimal.pow(1e10, player.ss.points));
			if (player.ne.unlocked) base = base.times(tmp.ne.thoughtEff2);
			
			if (hasUpgrade("t", 41) && player.i.buyables[12].gte(4)) base = base.pow(1.5);
			return base;
		},
		effect() { 
			if (!unl(this.layer)) return new Decimal(1);
			let gain = Decimal.pow(tmp.ss.effBase, player.ss.points).sub(1);
			if (hasUpgrade("ss", 13)) gain = gain.times(upgradeEffect("ss", 13));
			if (player.o.unlocked) gain = gain.times(buyableEffect("o", 13));
			if (player.m.unlocked) gain = gain.times(tmp.m.hexEff);
			return gain;
		},
		autoPrestige() { return player.ss.auto && hasMilestone("ba", 2) && player.ma.current!="ss" },
		effectDescription() {
			return "生成 "+format(tmp.ss.effect)+" 子空间/sec"+(tmp.nerdMode?("\n\(每个 "+format(tmp.ss.effBase)+"x)"):"")
		},
		update(diff) {
			if (player.ss.unlocked) player.ss.subspace = player.ss.subspace.plus(tmp.ss.effect.times(diff));
		},
        row: 3, // Row the layer is in on the tree (0 is the first row)
        hotkeys: [
            {key: "S", description: "按 Shift+S 进行子空间重置。", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
        ],
		resetsNothing() { return hasMilestone("ba", 2) },
		effPow() {
			let pow = new Decimal(1);
			if (hasUpgrade("ss", 12)) pow = pow.times(upgradeEffect("ss", 12));
			if (hasUpgrade("ba", 12)) pow = pow.times(upgradeEffect("ba", 12).plus(1));
			return pow;
		},
		eff1() { return player.ss.subspace.plus(1).pow(tmp.ss.effPow).log10().pow(3).times(100).floor() },
		eff2() { return player.ss.subspace.plus(1).pow(tmp.ss.effPow).log10().plus(1).log10().div(6) },
		eff3() { return player.ss.subspace.plus(1).pow(tmp.ss.effPow).pow(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?3e3:1e3) },
		tabFormat: ["main-display",
			"prestige-button",
			"resource-display",
			"blank",
			["display-text",
				function() {return '你有 ' + format(player.ss.subspace) + ' 子空间，提供了 '+formatWhole(tmp.ss.eff1)+' 额外空间'+(tmp.nerdMode?(" ((log(x+1)^3)*"+format(tmp.ss.effPow.pow(3).times(100))+")"):"")+'，使建筑增强 '+format(tmp.ss.eff2.times(100))+'%'+(tmp.nerdMode?(" (log(log(x+1)*"+format(tmp.ss.effPow)+"+1)/6)"):"")+'，并使建筑价格降低 '+format(tmp.ss.eff3)+'x.'+(tmp.nerdMode?(" ((x+1)^"+format(tmp.ss.effPow.times(1e3))+")"):"")},
					{}],
			"blank",
			"upgrades",
		],
        increaseUnlockOrder: ["o"],
        doReset(resettingLayer){ 
			let keep = [];
			if (hasMilestone("ba", 2)) keep.push("upgrades");
            if (layers[resettingLayer].row > this.row) layerDataReset(this.layer, keep)
        },
        layerShown(){return (player.s.unlocked&&player.h.unlocked)||player.m.unlocked||player.ba.unlocked},
        branches: ["s"],
		upgrades: {
			rows: 4,
			cols: 3,
			11: {
				title: "空间觉醒",
				description: "空间能量的价格公式的底下降 (1e15 -> 1e10)。",
				cost() { return new Decimal((player.ma.current=="ss")?"1e14326":180) },
				currencyDisplayName: "子空间",
				currencyInternalName: "subspace",
				currencyLayer: "ss",
				unlocked() { return player.ss.unlocked },
			},
			12: {
				title: "子空间觉醒",
				description: "子空间能量加成所有子空间效果。",
				cost() { return new Decimal((player.ma.current=="ss")?20:2) },
				unlocked() { return hasUpgrade("ss", 11) },
				effect() { 
					let eff = player.ss.points.div(2.5).plus(1).sqrt();
					if (((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false) && eff.gte(2)) eff = eff.sub(1).times(100).pow(3).div(1e6).plus(1);
					return eff;
				},
				effectDisplay() { return format(tmp.ss.upgrades[12].effect.sub(1).times(100))+"%" },
				formula: "sqrt(x/2.5)*100",
			},
			13: {
				title: "粉碎使徒",
				description: "诡异加成子空间获取。",
				cost() { return new Decimal((player.ma.current=="ss")?"2e14382":1e3) },
				currencyDisplayName: "子空间",
				currencyInternalName: "subspace",
				currencyLayer: "ss",
				unlocked() { return hasUpgrade("ss", 11) },
				effect() { return player.q.points.plus(1).log10().div(10).plus(1).pow(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?400:1) },
				effectDisplay() { return format(tmp.ss.upgrades[13].effect)+"x" },
				formula: "log(x+1)/10+1",
			},
			21: {
				title: "非法升级",
				description: "超级增幅器和超级生成器降价 20%。",
				cost() { return new Decimal((player.ma.current=="ss")?"1e16708":1e4) },
				currencyDisplayName: "子空间",
				currencyInternalName: "subspace",
				currencyLayer: "ss",
				unlocked() { return hasUpgrade("ss", 13) },
			},
			22: {
				title: "太阳之下",
				description: "<b>太阳核心</b> 使用更好的公式。",
				cost() { return new Decimal((player.ma.current=="ss")?"1e17768":4e5) },
				currencyDisplayName: "子空间",
				currencyInternalName: "subspace",
				currencyLayer: "ss",
				unlocked() { return hasUpgrade("ss", 21)&&player.o.unlocked },
			},
			23: {
				title: "刹那",
				description: "<b>永恒</b> 效果随时间增长（而不是下降）。",
				cost() { return new Decimal((player.ma.current=="ss")?"5e17768":1e6) },
				currencyDisplayName: "子空间",
				currencyInternalName: "subspace",
				currencyLayer: "ss",
				unlocked() { return hasUpgrade("ss", 21)&&player.o.unlocked },
			},
			31: {
				title: "止步",
				description: "未使用的空间提供免费建筑。",
				cost() { return new Decimal((player.ma.current=="ss")?1626:42) },
				currencyDisplayName: "空间能量",
				currencyInternalName: "points",
				currencyLayer: "s",
				unlocked() { return hasUpgrade("ss", 22)||hasUpgrade("ss", 23) },
				effect() { return tmp.s.space.plus(1).cbrt().sub(1).times(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?2:1).floor() },
				effectDisplay() { return "+"+formatWhole(tmp.ss.upgrades[31].effect) },
				formula: "cbrt(x+1)-1",
			},
			32: {
				title: "超越无限",
				description: "诡异层加成子空间能量和超级生成器底数。.",
				cost() { return new Decimal((player.ma.current=="ss")?1628:43) },
				currencyDisplayName: "空间能量",
				currencyInternalName: "points",
				currencyLayer: "s",
				unlocked() { return hasUpgrade("ss", 31) },
				effect() { return player.q.buyables[11].sqrt().div(1.25) },
				effectDisplay() { return "+"+format(tmp.ss.upgrades[32].effect) },
				formula: "sqrt(x)/1.25",
			},
			33: {
				title: "永辉",
				description: "<b>永恒</b> 效果基于你本轮游戏时长，太阳核心加成太阳能。",
				cost() { return new Decimal((player.ma.current=="ss")?"1e17796":2.5e7) },
				currencyDisplayName: "子空间",
				currencyInternalName: "subspace",
				currencyLayer: "ss",
				unlocked() { return hasUpgrade("ss", 23)&&hasUpgrade("ss", 31) },
				effect() { return player.o.buyables[11].plus(1).log10().div(10) },
				effectDisplay() { return "+"+format(tmp.ss.upgrades[33].effect.times(100))+"%" },
				formula: "log(x+1)*10",
				style: {"font-size": "9px"},
			},
			41: {
				title: "更多太阳",
				description: "解锁日冕波动。",
				cost() { return new Decimal((player.ma.current=="ss")?1628:46) },
				currencyDisplayName: "空间能量",
				currencyInternalName: "points",
				currencyLayer: "s",
				unlocked() { return hasUpgrade("ss", 33) },
			},
			42: {
				title: "hyper子空间",
				description: "建筑增强 100%（叠加）。",
				cost() { return new Decimal((player.ma.current=="ss")?"1e17799":"1e936") },
				currencyDisplayName: "子空间",
				currencyInternalName: "subspace",
				currencyLayer: "ss",
				unlocked() { return hasChallenge("h", 42) },
			},
			43: {
				title: "挑战加速",
				endpoint() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?"e1e11":"e1e6") },
				description() { return "当其小于 "+format(tmp.ss.upgrades[43].endpoint)+" 时，点数获取提升至 1.1 次幂，否则提升至 1.01 次幂。" },
				cost() { return new Decimal((player.ma.current=="ss")?"1e17800":"1e990") },
				currencyDisplayName: "子空间",
				currencyInternalName: "subspace",
				currencyLayer: "ss",
				unlocked() { return hasChallenge("h", 42) },
				style: {"font-size": "9px"},
			},
		},
})
/*
                        
                        
                        
                        
                        
                        
   mmmmmmm    mmmmmmm   
 mm:::::::m  m:::::::mm 
m::::::::::mm::::::::::m
m::::::::::::::::::::::m
m:::::mmm::::::mmm:::::m
m::::m   m::::m   m::::m
m::::m   m::::m   m::::m
m::::m   m::::m   m::::m
m::::m   m::::m   m::::m
m::::m   m::::m   m::::m
m::::m   m::::m   m::::m
mmmmmm   mmmmmm   mmmmmm
                        
                        
                        
                        
                        
                        
                        
*/
addLayer("m", {
		name: "magic", // This is optional, only used in a few places, If absent it just uses the layer id.
        symbol: "M", // This appears on the layer's node. Default is the id with the first letter capitalized
        position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
        startData() { return {
            unlocked: false,
			points: new Decimal(0),
			best: new Decimal(0),
			total: new Decimal(0),
			spellTimes: {
				11: new Decimal(0),
				12: new Decimal(0),
				13: new Decimal(0),
				14: new Decimal(0),
				15: new Decimal(0),
				16: new Decimal(0),
			},
			spellInputs: {
				11: new Decimal(1),
				12: new Decimal(1),
				13: new Decimal(1),
				14: new Decimal(1),
				15: new Decimal(1),
				16: new Decimal(1),
			},
			spellInput: "1",
			distrAll: false,
			hexes: new Decimal(0),
			auto: false,
			first: 0,
        }},
        color: "#eb34c0",
        requires: new Decimal(1e285), // Can be a function that takes requirement increases into account
        resource: "魔法", // Name of prestige currency
        baseResource: "障碍灵魂", // Name of resource prestige is based on
        baseAmount() {return player.h.points}, // Get the current amount of baseResource
        type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
        exponent() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?0.0085:0.007) }, // Prestige currency exponent
        gainMult() { // Calculate the multiplier for main currency from bonuses
            mult = new Decimal(1);
			if (hasAchievement("a", 74)) mult = mult.times(challengeEffect("h", 32));
            return mult.times(tmp.n.realDustEffs2?tmp.n.realDustEffs2.purpleBlue:new Decimal(1));
        },
        gainExp() { // Calculate the exponent on main currency from bonuses
            return new Decimal(1)
        },
        row: 4, // Row the layer is in on the tree (0 is the first row)
        hotkeys: [
            {key: "m", description: "按 M 进行魔法重置。", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
        ],
        doReset(resettingLayer){ 
			let keep = [];
			if (hasMilestone("hn", 0)) keep.push("milestones")
			if (layers[resettingLayer].row > this.row) layerDataReset(this.layer, keep)
        },
		passiveGeneration() { return (hasMilestone("hn", 1)&&player.ma.current!="m")?1:0 },
        layerShown(){return player.h.unlocked&&player.o.unlocked },
        branches: ["o","h","q"],
		spellTime() { 
			let time = new Decimal(60);
			if (hasMilestone("m", 3)) time = time.times(tmp.m.spellInputAmt.div(100).plus(1).log10().plus(1));
			return time;
		},
		spellPower() { 
			if (!unl(this.layer)) return new Decimal(0);
			let power = new Decimal(1);
			if (tmp.ps.impr[21].unlocked) power = power.plus(tmp.ps.impr[21].effect.sub(1));
			if (player.n.buyables[11].gte(3)) power = power.plus(buyableEffect("o", 31));
			if ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false) power = power.plus(.5);
			return power;
		},
		hexGain() { 
			let gain = new Decimal(1);
			if (tmp.ps.impr[12].unlocked) gain = gain.times(tmp.ps.impr[12].effect);
			return gain;
		},
		mainHexEff() { return player.m.hexes.times(2).plus(1).pow(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?5:10) },
		hexEff() { return softcap("hex", tmp.m.mainHexEff) },
		update(diff) {
			if (!player.m.unlocked) return;
			if (player.m.auto && hasMilestone("hn", 2) && player.m.distrAll && player.ma.current!="m") layers.m.castAllSpells(true, diff);
			for (let i=11;i<=(10+tmp.m.spellsUnlocked);i++) {
				if (tmp.m.buyables[i].unlocked && player.m.auto && hasMilestone("hn", 2) && (!player.m.distrAll||tmp.t.effect2.gt(1)) && player.ma.current!="m") {
					player.m.spellInputs[i] = (player.m.spellTimes[i].gt(0)?player.m.spellInputs[i].max(tmp.m.spellInputAmt):tmp.m.spellInputAmt);
                    player.m.hexes = player.m.hexes.plus(softcap("hexGain", tmp.m.hexGain.times(player.m.spellInputs[i]).times(diff)));
					player.m.spellTimes[i] = tmp.m.spellTime;
				} else if (player.m.spellTimes[i].gt(0)) player.m.spellTimes[i] = player.m.spellTimes[i].sub(diff).max(0);
			}
		},
		spellInputAmt() {
			if (hasMilestone("m", 3) && player.m.spellInput!="1") {
				let factor = new Decimal(player.m.spellInput.split("%")[0]).div(100);
				return player.m.points.times(factor.max(0.01)).floor().max(1);
			} else return new Decimal(1);
		},
		hexEffDesc() {
			let nerd = (tmp.nerdMode?" (2*x+1)^5":"")
			if ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false) return "增幅障碍灵魂、诡异和 SE 获取 "+format(tmp.m.mainHexEff)+"x，并增幅子空间获取 "+format(tmp.m.hexEff) + "x" + nerd
			else return "增幅障碍灵魂、诡异、 SE 和子空间获取 "+format(tmp.m.hexEff)+"x"+nerd
		},
		tabFormat: ["main-display",
			"prestige-button",
			"resource-display",
			"blank",
			"milestones",
			"blank",
			["display-text", function() { return tmp.m.spellPower.eq(1)?"":("魔法强度: "+format(tmp.m.spellPower.times(100))+"%") }], "blank",
			"buyables",
			["display-text",
				function() {return "你有 "+formatWhole(player.m.hexes)+" 妖术, "+tmp.m.hexEffDesc },
					{}],
		],
		spellsUnlocked() { return 3+player.i.buyables[13].toNumber() },
		castAllSpells(noSpend=false, diff=1) {
			let cost = tmp.m.spellInputAmt;
			let input = tmp.m.spellInputAmt.div(tmp.m.spellsUnlocked);
			for (let i=11;i<=(10+tmp.m.spellsUnlocked);i++) {
				player.m.spellInputs[i] = (player.m.spellTimes[i].gt(0)?player.m.spellInputs[i].max(input):input);
				player.m.spellTimes[i] = tmp.m.spellTime;
			}
			if (!noSpend) player.m.points = player.m.points.sub(cost)
            player.m.hexes = player.m.hexes.plus(softcap("hexGain", tmp.m.hexGain.times(cost).times(diff)))
		},
		buyables: {
			rows: 1,
			cols: 6,
			11: {
				title: "装载增幅器",
				cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
					return tmp.m.spellInputAmt;
                },
				effect() {
					let power = tmp.m.spellPower.times(player.m.spellInputs[this.id].max(1).log10().plus(1));
					if (player.m.spellTimes[this.id].eq(0)) power = new Decimal(0);
					let eff = power.div(2).plus(1)
					if (hasUpgrade("ba", 31)) eff = Decimal.pow(1.1, power).times(eff);
					eff = softcap("spell1", eff);
					return eff.div(1.5).max(1);
				},
				display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    let display = "效果: 增幅器底数提升至 ^1.05 次幂， x" + format(data.effect)+"\n\
					时间: "+formatTime(player.m.spellTimes[this.id]||0);
					if (hasMilestone("m", 3)) display += "\n "+(tmp.nerdMode?("公式: ((log(inserted+1)+1)/2+1)/1.5"):("待插入: "+formatWhole(tmp.m.spellInputAmt.div((player.m.distrAll && hasMilestone("m", 4))?tmp.m.spellsUnlocked:1))));
					return display;
                },
                unlocked() { return player[this.layer].unlocked }, 
                canAfford() {
                    return player.m.points.gte(tmp[this.layer].buyables[this.id].cost)
				},
                buy() { 
					if (player.m.distrAll && hasMilestone("m", 4)) {
						layers.m.castAllSpells();
						return;
					}
                    cost = tmp[this.layer].buyables[this.id].cost
					player.m.spellInputs[this.id] = (player.m.spellTimes[this.id].gt(0)?player.m.spellInputs[this.id].max(tmp.m.spellInputAmt):tmp.m.spellInputAmt);
                    player.m.points = player.m.points.sub(cost)
                    player.m.hexes = player.m.hexes.plus(softcap("hexGain", tmp.m.hexGain.times(cost)))
					player.m.spellTimes[this.id] = tmp.m.spellTime;
                },
                buyMax() {}, // You'll have to handle this yourself if you want
                style: {'height':'150px', 'width':'150px'},
			},
			12: {
				title: "时间折跃",
				cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                  return tmp.m.spellInputAmt;
                },
				effect() {
					let power = tmp.m.spellPower.times(player.m.spellInputs[this.id].max(1).log10().plus(1));
					if (player.m.spellTimes[this.id].eq(0)) power = new Decimal(0);
					let eff = power.div(5).plus(1)
					if (hasUpgrade("ba", 31)) eff = Decimal.pow(1.1, power).times(eff);
					eff = softcap("spell2", eff);
					return eff.div(1.2).max(1);
				},
				display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    let display = "效果: 时间胶囊底数提升至 ^1.1 次幂， x" + format(data.effect)+"\n\
					时间: "+formatTime(player.m.spellTimes[this.id]||0);
					if (hasMilestone("m", 3)) display += "\n "+(tmp.nerdMode?("公式: ((log(inserted+1)+1)/5+1)/1.2"):("待插入: "+formatWhole(tmp.m.spellInputAmt.div((player.m.distrAll && hasMilestone("m", 4))?tmp.m.spellsUnlocked:1))));
					return display;
                },
                unlocked() { return player[this.layer].unlocked }, 
                canAfford() {
                    return player.m.points.gte(tmp[this.layer].buyables[this.id].cost)
				},
                buy() { 
					if (player.m.distrAll && hasMilestone("m", 4)) {
						layers.m.castAllSpells();
						return;
					}
                    cost = tmp[this.layer].buyables[this.id].cost
					player.m.spellInputs[this.id] = (player.m.spellTimes[this.id].gt(0)?player.m.spellInputs[this.id].max(tmp.m.spellInputAmt):tmp.m.spellInputAmt);
                    player.m.points = player.m.points.sub(cost)
                    player.m.hexes = player.m.hexes.plus(softcap("hexGain", tmp.m.hexGain.times(cost)))
					player.m.spellTimes[this.id] = tmp.m.spellTime;
                },
                buyMax() {}, // You'll have to handle this yourself if you want
                style: {'height':'150px', 'width':'150px'},
			},
			13: {
				title: "诡异聚焦",
				cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                   return tmp.m.spellInputAmt;
                },
				effect() {
					let power = tmp.m.spellPower.times(player.m.spellInputs[this.id].max(1).log10().plus(1));
					if (player.m.spellTimes[this.id].eq(0)) power = new Decimal(0);
					let eff = power.times(1.25)
					eff = softcap("spell3", eff);
					return eff;
				},
				display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    let display = "效果: +" + format(data.effect)+" 个免费诡异层\n\
					时间: "+formatTime(player.m.spellTimes[this.id]||0);
					if (hasMilestone("m", 3)) display += "\n "+(tmp.nerdMode?("公式: (log(inserted+1)+1)*1.25"):("待插入: "+formatWhole(tmp.m.spellInputAmt.div((player.m.distrAll && hasMilestone("m", 4))?tmp.m.spellsUnlocked:1))));
					return display;
                },
                unlocked() { return player[this.layer].unlocked }, 
                canAfford() {
                    return player.m.points.gte(tmp[this.layer].buyables[this.id].cost)
				},
                buy() { 
					if (player.m.distrAll && hasMilestone("m", 4)) {
						layers.m.castAllSpells();
						return;
					}
                    cost = tmp[this.layer].buyables[this.id].cost
					player.m.spellInputs[this.id] = (player.m.spellTimes[this.id].gt(0)?player.m.spellInputs[this.id].max(tmp.m.spellInputAmt):tmp.m.spellInputAmt);
                    player.m.points = player.m.points.sub(cost)
                    player.m.hexes = player.m.hexes.plus(softcap("hexGain", tmp.m.hexGain.times(cost)))
					player.m.spellTimes[this.id] = tmp.m.spellTime;
                },
                buyMax() {}, // You'll have to handle this yourself if you want
                style: {'height':'150px', 'width':'150px'},
			},
			14: {
				title: "空间压缩",
				cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                   return tmp.m.spellInputAmt;
                },
				effect() {
					let power = tmp.m.spellPower.times(player.m.spellInputs[this.id].max(1).log10().plus(1));
					if (player.m.spellTimes[this.id].eq(0)) power = new Decimal(0);
					let eff = Decimal.sub(1, Decimal.div(1, power.plus(1).log10().div(500).plus(1).sqrt()));
					return eff;
				},
				display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    let display = "效果: 建筑价格缩放减缓 " + format(data.effect.times(100))+"%\n\
					时间: "+formatTime(player.m.spellTimes[this.id]||0);
					if (hasMilestone("m", 3)) display += "\n "+(tmp.nerdMode?("公式: 1-1/sqrt(log(log(inserted+1)+1)/500+1)"):("待插入: "+formatWhole(tmp.m.spellInputAmt.div((player.m.distrAll && hasMilestone("m", 4))?tmp.m.spellsUnlocked:1))));
					return display;
                },
                unlocked() { return player[this.layer].unlocked && player.i.buyables[13].gte(1) }, 
                canAfford() {
                    return player.m.points.gte(tmp[this.layer].buyables[this.id].cost)
				},
                buy() { 
					if (player.m.distrAll && hasMilestone("m", 4)) {
						layers.m.castAllSpells();
						return;
					}
                    cost = tmp[this.layer].buyables[this.id].cost
					player.m.spellInputs[this.id] = (player.m.spellTimes[this.id].gt(0)?player.m.spellInputs[this.id].max(tmp.m.spellInputAmt):tmp.m.spellInputAmt);
                    player.m.points = player.m.points.sub(cost)
                    player.m.hexes = player.m.hexes.plus(softcap("hexGain", tmp.m.hexGain.times(cost)))
					player.m.spellTimes[this.id] = tmp.m.spellTime;
                },
                buyMax() {}, // You'll have to handle this yourself if you want
                style: {'height':'150px', 'width':'150px'},
			},
			15: {
				title: "超越阻碍",
				cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                   return tmp.m.spellInputAmt;
                },
				effect() {
					let power = tmp.m.spellPower.times(player.m.spellInputs[this.id].max(1).log10().plus(1));
					if (player.m.spellTimes[this.id].eq(0)) power = new Decimal(0);
					let eff = Decimal.sub(1, Decimal.div(1, power.plus(1).log10().times(140).plus(1).sqrt()));
					return eff;
				},
				display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    let display = "效果: 可重复障碍的需求缩放减缓 " + format(data.effect.times(100))+"%\n\
					时间: "+formatTime(player.m.spellTimes[this.id]||0);
					if (hasMilestone("m", 3)) display += "\n "+(tmp.nerdMode?("公式: 1-1/sqrt(log(log(inserted+1)+1)*140+1)"):("待插入: "+formatWhole(tmp.m.spellInputAmt.div((player.m.distrAll && hasMilestone("m", 4))?tmp.m.spellsUnlocked:1))));
					return display;
                },
                unlocked() { return player[this.layer].unlocked && player.i.buyables[13].gte(2) }, 
                canAfford() {
                    return player.m.points.gte(tmp[this.layer].buyables[this.id].cost)
				},
                buy() { 
					if (player.m.distrAll && hasMilestone("m", 4)) {
						layers.m.castAllSpells();
						return;
					}
                    cost = tmp[this.layer].buyables[this.id].cost
					player.m.spellInputs[this.id] = (player.m.spellTimes[this.id].gt(0)?player.m.spellInputs[this.id].max(tmp.m.spellInputAmt):tmp.m.spellInputAmt);
                    player.m.points = player.m.points.sub(cost)
                    player.m.hexes = player.m.hexes.plus(softcap("hexGain", tmp.m.hexGain.times(cost)))
					player.m.spellTimes[this.id] = tmp.m.spellTime;
                },
                buyMax() {}, // You'll have to handle this yourself if you want
                style: {'height':'150px', 'width':'150px'},
			},
			16: {
				title: "生成器扩容",
				cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                   return tmp.m.spellInputAmt;
                },
				effect() {
					let power = tmp.m.spellPower.times(player.m.spellInputs[this.id].max(1).log10().plus(1));
					if (player.m.spellTimes[this.id].eq(0)) power = new Decimal(0);
					let eff = power.plus(1).pow(400);
					return eff;
				},
				display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    let display = "效果: 超级生成器底数乘以 " + format(data.effect)+"\n\
					时间: "+formatTime(player.m.spellTimes[this.id]||0);
					if (hasMilestone("m", 3)) display += "\n "+(tmp.nerdMode?("公式: (log(inserted+1)+1)^400"):("待插入: "+formatWhole(tmp.m.spellInputAmt.div((player.m.distrAll && hasMilestone("m", 4))?tmp.m.spellsUnlocked:1))));
					return display;
                },
                unlocked() { return player[this.layer].unlocked && player.i.buyables[13].gte(3) }, 
                canAfford() {
                    return player.m.points.gte(tmp[this.layer].buyables[this.id].cost)
				},
                buy() { 
					if (player.m.distrAll && hasMilestone("m", 4)) {
						layers.m.castAllSpells();
						return;
					}
                    cost = tmp[this.layer].buyables[this.id].cost
					player.m.spellInputs[this.id] = (player.m.spellTimes[this.id].gt(0)?player.m.spellInputs[this.id].max(tmp.m.spellInputAmt):tmp.m.spellInputAmt);
                    player.m.points = player.m.points.sub(cost)
                    player.m.hexes = player.m.hexes.plus(softcap("hexGain", tmp.m.hexGain.times(cost)))
					player.m.spellTimes[this.id] = tmp.m.spellTime;
                },
                buyMax() {}, // You'll have to handle this yourself if you want
                style: {'height':'150px', 'width':'150px'},
			},
		},
		milestones: {
			0: {
				requirementDescription: "2 总魔法",
				done() { return player.m.total.gte(2) || (hasMilestone("hn", 0)) },
				effectDescription: "每秒获取 100% 阳光和阳光购买项。",
			},
			1: {
				requirementDescription: "3 总魔法",
				done() { return player.m.total.gte(3) || (hasMilestone("hn", 0)) },
				effectDescription: '对任何重置保留已完成的障碍。',
			},
			2: {
				requirementDescription: "10 总魔法",
				done() { return player.m.total.gte(10) || (hasMilestone("hn", 0)) },
				effectDescription: "每秒获取 100% 障碍灵魂。",
			},
			3: {
				requirementDescription: "5,000 总魔法",
				done() { return player.m.total.gte(5e3) || (hasMilestone("hn", 0)) },
				effectDescription: "你可以插入更多魔法来使它们更长更强。",
				toggles: [{
					layer: "m",
					varName: "spellInput",
					options: ["1","10%","50%","100%"],
				}],
			},
			4: {
				unlocked() { return hasMilestone("m", 3) },
				requirementDescription: "1e10 总魔法",
				done() { return player.m.total.gte(1e10) || (hasMilestone("hn", 0)) },
				effectDescription: "释放一个魔法时，同时释放其他魔法（魔法消耗是分散的）。",
				toggles: [["m", "distrAll"]],
			},
		},
})
/*
                                      
bbbbbbbb                              
b::::::b                              
b::::::b                              
b::::::b                              
 b:::::b                              
 b:::::bbbbbbbbb      aaaaaaaaaaaaa   
 b::::::::::::::bb    a::::::::::::a  
 b::::::::::::::::b   aaaaaaaaa:::::a 
 b:::::bbbbb:::::::b           a::::a 
 b:::::b    b::::::b    aaaaaaa:::::a 
 b:::::b     b:::::b  aa::::::::::::a 
 b:::::b     b:::::b a::::aaaa::::::a 
 b:::::b     b:::::ba::::a    a:::::a 
 b:::::bbbbbb::::::ba::::a    a:::::a 
 b::::::::::::::::b a:::::aaaa::::::a 
 b:::::::::::::::b   a::::::::::aa:::a
 bbbbbbbbbbbbbbbb     aaaaaaaaaa  aaaa
                                      
                                      
                                      
                                      
                                      
                                      
                                      
*/
addLayer("ba", {
		name: "balance", // This is optional, only used in a few places, If absent it just uses the layer id.
        symbol: "BA", // This appears on the layer's node. Default is the id with the first letter capitalized
        position: 3, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
        startData() { return {
            unlocked: false,
			points: new Decimal(0),
			best: new Decimal(0),
			total: new Decimal(0),
			allotted: 0.5,
			pos: new Decimal(0),
			neg: new Decimal(0),
			keepPosNeg: false,
			first: 0,
        }},
        color: "#fced9f",
        requires: new Decimal("1e365"), // Can be a function that takes requirement increases into account
        resource: "平衡", // Name of prestige currency
        baseResource: "诡异", // Name of resource prestige is based on
        baseAmount() {return player.q.points}, // Get the current amount of baseResource
        type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
        exponent() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?0.0125:0.005) }, // Prestige currency exponent
        gainMult() { // Calculate the multiplier for main currency from bonuses
            mult = new Decimal(1);
			if (hasAchievement("a", 74)) mult = mult.times(challengeEffect("h", 32));
			if (player.mc.unlocked) mult = mult.times(clickableEffect("mc", 22));
            return mult
        },
        gainExp() { // Calculate the exponent on main currency from bonuses
            return new Decimal(1)
        },
        row: 4, // Row the layer is in on the tree (0 is the first row)
        hotkeys: [
            {key: "a", description: "按 A 进行平衡重置。", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
        ],
        doReset(resettingLayer){ 
			let keep = [];
			if (!(hasMilestone("ba", 4) && player.ba.keepPosNeg)) {
				player.ba.pos = new Decimal(0);
				player.ba.neg = new Decimal(0);
			}
			if (hasMilestone("hn", 0)) keep.push("milestones")
			if (hasMilestone("hn", 3)) keep.push("upgrades")
			if (layers[resettingLayer].row > this.row) layerDataReset(this.layer, keep)
        },
        layerShown(){return player.q.unlocked&&player.ss.unlocked },
        branches: ["q","ss"],
		update(diff) {
			if (!player.ba.unlocked) return;
			player.ba.pos = player.ba.pos.plus(tmp.ba.posGain.times(diff));
			player.ba.neg = player.ba.neg.plus(tmp.ba.negGain.times(diff));
		},
		passiveGeneration() { return (hasMilestone("hn", 1)&&player.ma.current!="ba")?1:0 },
		dirBase() { return player.ba.points.times(10) },
		posGainMult() {
			let mult = new Decimal(1);
			if (hasUpgrade("ba", 24)) mult = mult.times(upgradeEffect("ba", 24).pos);
			return mult;
		},
		posGain() { return Decimal.pow(tmp.ba.dirBase, (hasMilestone("hn", 2)&&player.ma.current!="ba")?1:player.ba.allotted).times((hasMilestone("hn", 2)&&player.ma.current!="ba")?1:(player.ba.allotted)).times(tmp.ba.posGainMult) },
		posBuff() { 
			let eff = player.ba.pos.plus(1).log10().plus(1).div(tmp.ba.negNerf); 
			eff = softcap("posBuff", eff);
			return eff;
		},
		noNerfs() {
			return ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)
		},
		posNerf() { return tmp.ba.noNerfs?new Decimal(1):(player.ba.pos.plus(1).sqrt().pow(inChallenge("h", 41)?100:1)) },
		negGainMult() {
			let mult = new Decimal(1);
			if (hasUpgrade("ba", 24)) mult = mult.times(upgradeEffect("ba", 24).neg);
			return mult;
		},
		negGain() { return Decimal.pow(tmp.ba.dirBase, (hasMilestone("hn", 2)&&player.ma.current!="ba")?1:(1-player.ba.allotted)).times((hasMilestone("hn", 2)&&player.ma.current!="ba")?1:(1-player.ba.allotted)).times(tmp.ba.negGainMult) },
		negBuff() { 
			let eff = player.ba.neg.plus(1).pow((hasUpgrade("ba", 13))?10:1).div(tmp.ba.posNerf);
			eff = softcap("negBuff", eff);
			return eff;
		},
		negNerf() { return tmp.ba.noNerfs?new Decimal(1):(player.ba.neg.plus(1).log10().plus(1).sqrt().pow(inChallenge("h", 41)?100:1).div(hasUpgrade("ba", 14)?2:1).max(1)) },
		tabFormat: ["main-display",
			"prestige-button",
			"resource-display",
			"blank",
			"milestones",
			"blank",
			["clickable", 31],
			["row", [["clickable", 21], ["clickable", 11], "blank", ["bar", "balanceBar"], "blank", ["clickable", 12], ["clickable", 22]]],
			["row", [
				["column", [["display-text", function() {return tmp.nerdMode?("获取公式: "+format(tmp.ba.dirBase)+"^(1-barPercent/100)*(1-barBercent/100)"+(tmp.ba.negGainMult.eq(1)?"":("*"+format(tmp.ba.negGainMult)))):("+"+format(tmp.ba.negGain)+"/sec")}, {}], ["display-text", function() {return "消极: "+format(player.ba.neg)}, {}], ["display-text", function() {return (tmp.nerdMode?("效果公式: "+((hasUpgrade("ba", 13))?"(x+1)^10":"x+1")):("效果: 加成诡异层 "+format(tmp.ba.negBuff) + "x"))}, {}], ["display-text", function() {return tmp.ba.noNerfs?"":(tmp.nerdMode?("惩罚公式: "+(hasUpgrade("ba", 14)?"sqrt(log(x+1)+1)"+(inChallenge("h", 41)?"^100":"")+"/2":"sqrt(log(x+1)+1)")):("惩罚: 将积极效果除以 "+format(tmp.ba.negNerf)))}, {}], "blank", ["row", [["upgrade", 11], ["upgrade", 13]]]], {"max-width": "240px"}], 
				"blank", "blank", "blank", 
				["column", 
				[["display-text", function() {return tmp.nerdMode?("获取公式: "+format(tmp.ba.dirBase)+"^(barPercent/100)*(barBercent/100)"+(tmp.ba.posGainMult.eq(1)?"":("*"+format(tmp.ba.posGainMult)))):("+"+format(tmp.ba.posGain)+"/sec")}, {}], ["display-text", function() {return "积极: "+format(player.ba.pos)}, {}], ["display-text", function() {return (tmp.nerdMode?("效果公式: log(x+1)+1"):("效果: 加成子空间和时间底数 "+format(tmp.ba.posBuff + "x")))}, {}], ["display-text", function() {return tmp.ba.noNerfs?"":(tmp.nerdMode?("惩罚公式: sqrt(x+1)"+(inChallenge("h", 41)?"^100":"")):("惩罚: 将消极效果除以 "+format(tmp.ba.posNerf)))}, {}], "blank", ["row", [["upgrade", 14], ["upgrade", 12]]]], {"max-width": "240px"}]], {"visibility": function() { return player.ba.unlocked?"visible":"hidden" }}],
			["row", [["upgrade", 22], ["upgrade", 21], ["upgrade", 23]]],
			["row", [["upgrade", 31], ["upgrade", 24], ["upgrade", 32]]],
			["upgrade", 33],
			"blank", "blank"
		],
		bars: {
			balanceBar: {
				direction: RIGHT,
				width: 400,
				height: 20,
				progress() { return player.ba.allotted },
				unlocked() { return player.ba.unlocked },
				fillStyle() { 
					let r = 235 + (162 - 235) * tmp.ba.bars.balanceBar.progress;
					let g = 64 + (249 - 64) * tmp.ba.bars.balanceBar.progress;
					let b = 52 + (252 - 52) * tmp.ba.bars.balanceBar.progress;
					return {"background-color": ("rgb("+r+", "+g+", "+b+")") } 
				},
				borderStyle() { return {"border-color": "#fced9f"} },
			},
		},
		clickables: {
			rows: 3,
			cols: 2,
			11: {
				title: "-",
				unlocked() { return player.ba.unlocked },
				canClick() { return player.ba.allotted>0 },
				onClick() { player.ba.allotted = Math.max(player.ba.allotted-0.05, 0) },
				style: {"height": "50px", "width": "50px", "background-color": "rgb(235, 64, 52)"},
			},
			12: {
				title: "+",
				unlocked() { return player.ba.unlocked },
				canClick() { return player.ba.allotted<1 },
				onClick() { player.ba.allotted = Math.min(player.ba.allotted+0.05, 1) },
				style: {"height": "50px", "width": "50px", "background-color": "rgb(162, 249, 252)"},
			},
			21: {
				title: "&#8592;",
				unlocked() { return player.ba.unlocked },
				canClick() { return player.ba.allotted>0 },
				onClick() { player.ba.allotted = 0 },
				style: {"height": "50px", "width": "50px", "background-color": "rgb(235, 64, 52)"},
			},
			22: {
				title: "&#8594;",
				unlocked() { return player.ba.unlocked },
				canClick() { return player.ba.allotted<1 },
				onClick() { player.ba.allotted = 1 },
				style: {"height": "50px", "width": "50px", "background-color": "rgb(162, 249, 252)"},
			},
			31: {
				title: "C",
				unlocked() { return player.ba.unlocked },
				canClick() { return player.ba.allotted!=.5 },
				onClick() { player.ba.allotted = .5 },
				style: {"height": "50px", "width": "50px", "background-color": "yellow"},
			},
		},
		upgrades: {
			rows: 3,
			cols: 4,
			11: {
				title: "阴离子",
				description: "消极加成太阳能。",
				cost() { return new Decimal(player.ma.current=="ba"?"1e166666":5e7) },
				currencyDisplayName: "消极",
				currencyInternalName: "neg",
				currencyLayer: "ba",
				unlocked() { return hasMilestone("ba", 3) },
				effect() { 
					let ret = player.ba.neg.plus(1).log10().sqrt().div(10);
					ret = softcap("ba11", ret);
					return ret;
				},
				effectDisplay() { return "+"+format(tmp.ba.upgrades[11].effect.times(100))+"%" },
				formula: "sqrt(log(x+1))*10",
			},
			12: {
				title: "阳离子",
				description: "积极加成建筑效果和所有子空间效果。",
				cost() { return new Decimal(player.ma.current=="ba"?"1e166666":5e7) },
				currencyDisplayName: "积极",
				currencyInternalName: "pos",
				currencyLayer: "ba",
				unlocked() { return hasMilestone("ba", 3) },
				effect() { return softcap("ba12", player.ba.pos.plus(1).log10().cbrt().div(10)) },
				effectDisplay() { return "+"+format(tmp.ba.upgrades[12].effect.times(100))+"%" },
				formula: "cbrt(log(x+1))*10",
			},
			13: {
				title: "消极力量",
				description: "将消极效果提升至 10 次幂",
				cost() { return new Decimal(player.ma.current=="ba"?"1e189500":25e7) },
				currencyDisplayName: "消极",
				currencyInternalName: "neg",
				currencyLayer: "ba",
				unlocked() { return hasMilestone("ba", 3) },
			},
			14: {
				title: "积极氛围",
				description: "减半消极惩罚。",
				cost() { return new Decimal(player.ma.current=="ba"?"1e189500":25e7) },
				currencyDisplayName: "积极",
				currencyInternalName: "pos",
				currencyLayer: "ba",
				unlocked() { return hasMilestone("ba", 3) },
			},
			21: {
				title: "中性原子",
				description: "障碍灵魂的效果提升至 8 次幂。",
				cost() { return new Decimal(player.ma.current=="ba"?"1e189500":25e7) },
				unlocked() { return hasUpgrade("ba", 13)&&hasUpgrade("ba", 14) },
			},
			22: {
				title: "负质量",
				description: "消极同样加成障碍灵魂和诡异获取。",
				cost() { return new Decimal(player.ma.current=="ba"?"1e203000":2.5e11) },
				currencyDisplayName: "消极",
				currencyInternalName: "neg",
				currencyLayer: "ba",
				unlocked() { return hasUpgrade("ba", 21) },
			},
			23: {
				title: "高阶",
				description: "积极降低阳光价格。",
				cost() { return new Decimal(player.ma.current=="ba"?"1e203000":2.5e11) },
				currencyDisplayName: "积极",
				currencyInternalName: "pos",
				currencyLayer: "ba",
				unlocked() { return hasUpgrade("ba", 21) },
			},
			24: {
				title: "净中立",
				description: "积极和消极加成对方获取。",
				cost() { return new Decimal(player.ma.current=="ba"?"1e205000":2.5e12) },
				unlocked() { return hasUpgrade("ba", 22) && hasUpgrade("ba", 23) },
				effect() { 
					let ret = {
						pos: player.ba.neg.div(1e12).plus(1).log10().plus(1).pow(hasUpgrade("ba", 33)?15:5),
						neg: player.ba.pos.div(1e12).plus(1).log10().plus(1).pow(hasUpgrade("ba", 33)?15:5),
					} 
					if ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false) {
						ret.pos = Decimal.pow(10, ret.pos.log10().pow(1.5));
						ret.neg = Decimal.pow(10, ret.neg.log10().pow(1.5));
					}
					return ret;
				},
				effectDisplay() { return "Pos: "+format(tmp.ba.upgrades[24].effect.pos)+"x, Neg: "+format(tmp.ba.upgrades[24].effect.neg)+"x" },
				formula() { return "Pos: (log(neg/1e12+1)+1)^"+(hasUpgrade("ba", 33)?15:5)+", Neg: (log(pos/1e12+1)+1)^"+(hasUpgrade("ba", 33)?15:5) },
				style: {"font-size": "9px"},
			},
			31: {
				title: "实体退化",
				description: "前两个魔法使用更好的公式。",
				cost() { return new Decimal(player.ma.current=="ba"?"1e205500":1e52) },
				currencyDisplayName: "消极",
				currencyInternalName: "neg",
				currencyLayer: "ba",
				unlocked() { return hasChallenge("h", 41) },
			},
			32: {
				title: "实体重生",
				description: "积极加成超级生成器底数。",
				cost() { return new Decimal(player.ma.current=="ba"?"1e205500":1e52) },
				currencyDisplayName: "积极",
				currencyInternalName: "pos",
				currencyLayer: "ba",
				unlocked() { return hasChallenge("h", 41) },
				effect() { 
					let eff = softcap("ba32", player.ba.pos.plus(1).log10().div(50).plus(1).pow(10));
					if (hasUpgrade("hn", 44)) eff = eff.times(upgradeEffect("p", 44));
					if ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false) eff = eff.pow(10);
					return eff;
				},
				effectDisplay() { return format(tmp.ba.upgrades[32].effect)+"x" },
				formula: "(log(x+1)/50+1)^10",
				style: {"font-size": "9px"},
			},
			33: {
				title: "绝对平等",
				description: "<b>净中立</b> 的两个效果提升至三次方。",
				cost() { return new Decimal(player.ma.current=="ba"?"1e207500":2.5e51) },
				unlocked() { return hasChallenge("h", 41) },
			},
		},
		milestones: {
			0: {
				requirementDescription: "2 总平衡",
				done() { return player.ba.total.gte(2) || (hasMilestone("hn", 0)) },
				effectDescription: "每秒获得 100% 诡异，对所有重置保留诡异升级。",
			},
			1: {
				requirementDescription: "3 总平衡",
				done() { return player.ba.total.gte(3) || (hasMilestone("hn", 0)) },
				effectDescription: "解锁自动诡异层。",
				toggles: [["q", "auto"]],
			},
			2: {
				requirementDescription: "10 总平衡",
				done() { return player.ba.total.gte(10) || (hasMilestone("hn", 0)) },
				effectDescription: "对任何重置保留子空间升级，解锁自动子空间能量，子空间能量不再重置任何东西。",
				toggles: [["ss", "auto"]],
			},
			3: {
				unlocked() { return hasMilestone("ba", 2) },
				requirementDescription: "200,000 总平衡",
				done() { return player.ba.total.gte(2e5) || (hasMilestone("hn", 0)) },
				effectDescription: "解锁平衡升级。",
			},
			4: {
				unlocked() { return hasMilestone("ba", 3) },
				requirementDescription: "1e12 总平衡",
				done() { return player.ba.total.gte(1e12) || (hasMilestone("hn", 0)) },
				effectDescription: "你可以在重置时保留消极和积极。",
				toggles: [["ba", "keepPosNeg"]],
			},
		},
})
/*
                                     
                                     
                                     
                                     
                                     
                                     
ppppp   ppppppppp       ssssssssss   
p::::ppp:::::::::p    ss::::::::::s  
p:::::::::::::::::p ss:::::::::::::s 
pp::::::ppppp::::::ps::::::ssss:::::s
 p:::::p     p:::::p s:::::s  ssssss 
 p:::::p     p:::::p   s::::::s      
 p:::::p     p:::::p      s::::::s   
 p:::::p    p::::::pssssss   s:::::s 
 p:::::ppppp:::::::ps:::::ssss::::::s
 p::::::::::::::::p s::::::::::::::s 
 p::::::::::::::pp   s:::::::::::ss  
 p::::::pppppppp      sssssssssss    
 p:::::p                             
 p:::::p                             
p:::::::p                            
p:::::::p                            
p:::::::p                            
ppppppppp                            
                                     
*/
addLayer("ps", {
		name: "phantom souls", // This is optional, only used in a few places, If absent it just uses the layer id.
        symbol: "PS", // This appears on the layer's node. Default is the id with the first letter capitalized
        position: 2, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
        startData() { return {
            unlocked: false,
			points: new Decimal(0),
			best: new Decimal(0),
			prevH: new Decimal(0),
			souls: new Decimal(0),
			power: new Decimal(0),
			auto: false,
			autoW: false,
			autoGhost: false,
			first: 0,
        }},
        color: "#b38fbf",
        requires() { return new Decimal("1e16000") }, // Can be a function that takes requirement increases into account
        resource: "幽魂", // Name of prestige currency
        baseResource: "QE", // Name of resource prestige is based on
        baseAmount() {return player.q.energy}, // Get the current amount of baseResource
        type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
        exponent: new Decimal(1.5), // Prestige currency exponent
		base() { 
			let b = new Decimal("1e8000").root(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?2:1);
			if (tmp.ps.impr[32].unlocked) b = b.root(improvementEffect("ps", 32));
			return b;
		},
        gainMult() { // Calculate the multiplier for main currency from bonuses
            mult = new Decimal(1)
			if (player.i.buyables[11].gte(2)) mult = mult.div(buyableEffect("s", 17));
            return mult
        },
        gainExp() { // Calculate the exponent on main currency from bonuses
            return new Decimal(1)
        },
		canBuyMax() { return hasMilestone("hn", 9) },
        row: 4, // Row the layer is in on the tree (0 is the first row)
        hotkeys: [
            {key: "P", description: "按 Shift+P 进行幽魂重置。", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
        ],
		resetsNothing() { return hasMilestone("hn", 6) },
        doReset(resettingLayer){ 
			let keep = [];
			player.ps.souls = new Decimal(0);
			let keptGS = new Decimal(0);
			if (layers[resettingLayer].row <= this.row+1) keptGS = new Decimal(player.ps.buyables[21]);
            if (layers[resettingLayer].row > this.row) layerDataReset(this.layer, keep)
			player.ps.buyables[21] = keptGS;
        },
		update(diff) {
			if (hasMilestone("hn", 5)) {
				if (player.ps.autoW) layers.ps.buyables[11].buyMax();
				player.ps.souls = player.ps.souls.max(tmp.ps.soulGain.times(player.h.points.max(1).log10()))
			} else player.ps.souls = player.ps.souls.plus(player.h.points.max(1).log10().sub(player.ps.prevH.max(1).log10()).max(0).times(tmp.ps.soulGain));
			player.ps.prevH = new Decimal(player.h.points);
			if (hasMilestone("hn", 7)) player.ps.power = player.ps.power.root(tmp.ps.powerExp).plus(tmp.ps.powerGain.times(diff)).pow(tmp.ps.powerExp);
			else player.ps.power = new Decimal(0);
			if (player.ps.autoGhost && hasMilestone("ma", 0) && player.ma.current!="ps") layers.ps.buyables[21].buyMax();
		},
		autoPrestige() { return hasMilestone("hn", 4) && player.ps.auto && player.ma.current!="ps" },
        layerShown(){return player.m.unlocked && player.ba.unlocked},
        branches: ["q", ["h", 2]],
		soulGainExp() { return ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?1.2:1.5 },
		soulGainMult() {
			let mult = new Decimal(1);
			if (tmp.ps.buyables[11].effects.damned) mult = mult.times(tmp.ps.buyables[11].effects.damned||1);
			if (player.i.buyables[11].gte(1)) mult = mult.times(buyableEffect("s", 16));
			if (player.c.unlocked) mult = mult.times(tmp.c.eff4);
			return mult.times(tmp.n.dustEffs.purple);
		},
		soulGain() {
			let gain = (((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?Decimal.pow(tmp.ps.soulGainExp, player.ps.points):Decimal.pow(player.ps.points, tmp.ps.soulGainExp)).div(9.4).times(layers.ps.soulGainMult());
			return gain;
		},
		gainDisplay() {
			let gain = tmp.ps.soulGain;
			let display = "";
			if (gain.eq(0)) display = "0"
			else if (gain.gte(1)) display = "每 OoM 障碍灵魂生成" + format(gain)
			else display = "每 "+format(gain.pow(-1))+" OoM 障碍灵魂生成 1 个"
			return display;
		},
		soulEffExp() {
			let exp = new Decimal(1.5e3);
			if (tmp.ps.buyables[11].effects.damned) exp = exp.times(tmp.ps.buyables[11].effects.damned||1);
			if ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false) exp = exp.times(100);
			return exp;
		},
		soulEff() {
			let eff = player.ps.souls.plus(1).pow(layers.ps.soulEffExp());
			return eff;
		},
		powerGain() { return player.ps.souls.plus(1).times(tmp.ps.buyables[21].effect).times(tmp.n.dustEffs.purple) },
		powerExp() { return player.ps.points.sqrt().times(tmp.ps.buyables[21].effect) },
		tabFormat: {
			"Main Tab": {
				content: ["main-display",
					"prestige-button",
					"resource-display",
					"blank",
					["display-text", function() { return "你有 "+formatWhole(player.ps.souls)+" 恶魂 "+(tmp.nerdMode?("(公式: ("+(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes("ps"):false)?(format(tmp.ps.soulGainExp)+"^PS"):("PS^"+format(tmp.ps.soulGainExp)))+")*"+format(tmp.ps.soulGainMult.div(10))+")"):("(获得: "+tmp.ps.gainDisplay+")"))+": 将诡异改良需求除以 "+format(tmp.ps.soulEff)+(tmp.nerdMode?(" (x+1)^("+formatWhole(tmp.ps.soulEffExp)+")"):"") }],
					"blank",
					["buyable", 11],
				],
			},
			Boosters: {
				unlocked() { return hasMilestone("hn", 7) },
				buttonStyle() { return {'background-color': '#b38fbf'} },
				content: [
					"main-display",
					"blank",
					["buyable", 21],
					"blank",
					["display-text",
						function() {return '你有 ' + formatWhole(player.ps.power)+' 魂力'+(tmp.nerdMode?(" (获取公式: (damned+1), 指数公式: sqrt(ps))"):" (+"+format(tmp.ps.powerGain)+"/sec (基于恶魂)， 然后提升至 "+format(tmp.ps.powerExp)+" 次幂(基于幽魂))")+'，提供了下面的幽魂增幅器 (下一个在 '+format(tmp.ps.impr.overallNextImpr)+')'},
							{}],
					"blank",
					"improvements"],
			},
		},
		buyables: {
			rows: 2,
			cols: 1,
			11: {
				title: "幽灵",
				scaleSlow() {
					let speed = new Decimal(1);
					if ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false) speed = speed.times(2);
					return speed;
				},
				cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                    let cost1 = x.div(tmp.ps.buyables[this.id].scaleSlow).times(2).plus(1).floor();
					let cost2 = x.div(tmp.ps.buyables[this.id].scaleSlow).plus(1).pow(4).times(174).plus(200).floor();
                    return { phantom: cost1, damned: cost2 };
                },
				effects(adj=0) {
					let data = {};
					let x = player[this.layer].buyables[this.id].plus(adj);
					if (x.gte(1)) data.hindr = x.min(3).toNumber();
					if (x.gte(2)) data.damned = x.sub(1).times(0.5).div(10/9.4).plus(1);
					if (x.gte(4)) data.quirkImpr = x.div(2).sub(1).floor().min(3).toNumber();
					return data;
				},
				display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    let display = ((tmp.nerdMode?("价格公式: 2*x+1 幽魂, (x+1)^4*174+200 恶魂"):("价格: " + formatWhole(data.cost.phantom) + " 幽魂， "+formatWhole(data.cost.damned)+" 恶魂"))+"\n\
                    数量: " + formatWhole(player[this.layer].buyables[this.id])+"\n\
					效果: ")
					let curr = data.effects;
					let next = this.effects(1);
					if (Object.keys(next).length>0) {
						if (next.hindr) {
							display += "\n"
							if (curr.hindr) display += curr.hindr+" 新的障碍"+(curr.hindr>=3?" (已满)":"")
							else display += "<b>下一个: 解锁一个新的障碍</b>"
						}
						if (next.damned) {
							display += "\n"
							if (curr.damned) display += "将恶魂获取和效果指数乘以 "+format(curr.damned)+(tmp.nerdMode?" ((x-1)*0.5+1)":"");
							else display += "<b>下一个: 加成恶魂获取和效果指数</b>"
						}
						if (next.quirkImpr) {
							display += "\n"
							if (curr.quirkImpr) display += curr.quirkImpr+" 新诡异改良"+(curr.quirkImpr>=3?" (已满)":"")
							else if (next.quirkImpr>(curr.quirkImpr||0)) display += "<b>下一个: 解锁一个新的诡异改良</b>"
						}
					} else display += "None"
					return display;
                },
                unlocked() { return player[this.layer].unlocked }, 
                canAfford() {
                    return player.ps.points.gte(tmp[this.layer].buyables[this.id].cost.phantom)&&player.ps.souls.gte(tmp[this.layer].buyables[this.id].cost.damned)},
                buy() { 
                    cost = tmp[this.layer].buyables[this.id].cost
					if (!hasMilestone("hn", 4)) {
						player.ps.points = player.ps.points.sub(cost.phantom)
						player.ps.souls = player.ps.souls.sub(cost.damned)
					} 
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                },
                buyMax() {
					let target = player.ps.points.sub(1).div(2).min(player.ps.souls.sub(200).div(174).root(4).sub(1)).times(tmp.ps.buyables[this.id].scaleSlow).plus(1).floor().max(0)
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].max(target)
				},
                style: {'height':'200px', 'width':'200px'},
				autoed() { return hasMilestone("hn", 5) && player.ps.autoW },
			},
			21: {
				title: "灵魂",
				scaleSlow() {
					let slow = new Decimal(1);
					if (hasUpgrade("hn", 51)) slow = slow.times(2);
					if ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false) slow = slow.times(1.2);
					if (tmp.ps.impr[31].unlocked) slow = slow.times(improvementEffect("ps", 31));
					return slow;
				},
				cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                    let cost = Decimal.pow(10, Decimal.pow(2, x.div(this.scaleSlow()))).times(x.eq(0)?1e21:1e22);
					if (hasUpgrade("hn", 51)) cost = cost.div(upgradeEffect("hn", 51));
					return cost;
                },
				effect() {
					return player[this.layer].buyables[this.id].div(25).plus(1).pow(2);
				},
				effect2() {
					return player[this.layer].buyables[this.id].div(10).plus(1);
				},
				display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    let display = ((tmp.nerdMode?("价格公式: (10^(2^x))*1e22"):("价格: " + formatWhole(data.cost) + " 魂力"))+"\n\
                    数量: " + formatWhole(player[this.layer].buyables[this.id])+"\n\
					效果: "+(tmp.nerdMode?("公式 1: (x/25+1)^2, 公式 2: (x/10+1)"):("加成魂力获取 "+format(tmp.ps.buyables[this.id].effect)+"，并增幅幽魂增幅器效果 "+format(tmp.ps.buyables[this.id].effect2.sub(1).times(100))+"%")))
					return display;
                },
                unlocked() { return player[this.layer].unlocked }, 
                canAfford() {
                    return player.ps.power.gte(tmp[this.layer].buyables[this.id].cost)},
                buy() { 
                    cost = tmp[this.layer].buyables[this.id].cost
					player.ps.power = player.ps.power.sub(cost);
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                },
                buyMax() {
					let target = player.ps.power.times(hasUpgrade("hn", 51)?upgradeEffect("hn", 51):1).div(1e22).max(1).log10().max(1).log(2).times(this.scaleSlow()).plus(1).floor();
					player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].max(target);
				},
                style: {'height':'200px', 'width':'200px'},
				autoed() { return player.ps.autoGhost && hasMilestone("ma", 0) && player.ma.current!="ps" },
			},
		},
		impr: {
			baseReq() { 
				let req = new Decimal(1e20).div(99);
				return req;
			},
			amount() { 
				let amt = player.ps.power.div(this.baseReq()).plus(1).log10().div(4).root(1.5).max(0);
				//if (amt.gte(270)) amt = amt.log10().times(270/Math.log10(270));
				return amt.floor();
			},
			overallNextImpr() { 
				let impr = tmp.ps.impr.amount.plus(1);
				//if (impr.gte(270)) impr = Decimal.pow(10, impr.div(270/Math.log10(270)));
				return Decimal.pow(10, impr.pow(1.5).times(4)).sub(1).times(this.baseReq()) 
			},
			nextAt(id=11) { 
				let impr = getImprovements("ps", id).times(tmp.ps.impr.activeRows*tmp.ps.impr.activeCols).add(tmp.ps.impr[id].num);
				//if (impr.gte(270)) impr = Decimal.pow(10, impr.div(270/Math.log10(270)));
				return Decimal.pow(10, impr.pow(1.5).times(4)).sub(1).times(this.baseReq());
			},
			power() { return tmp.ps.buyables[21].effect2.times(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?1.1:1) },
			resName: "魂力",
			rows: 3,
			cols: 2,
			activeRows: 2,
			activeCols: 2,
			11: {
				num: 1,
				title: "幽魂增幅器 I",
				description: "增幅太阳能。",
				unlocked() { return hasMilestone("hn", 7) },
				effect() { return getImprovements("ps", 11).times(tmp.ps.impr.power).div(20).plus(1).sqrt() },
				effectDisplay() { return "+"+format(tmp.ps.impr[11].effect.sub(1).times(100))+"% (累乘)" },
				formula: "sqrt(x*5%)",
				style: {height: "150px", width: "150px"},
			},
			12: {
				num: 2,
				title: "幽魂增幅器 II",
				description: "增幅妖术获取。",
				unlocked() { return hasMilestone("hn", 7) },
				effect() { return Decimal.pow(10, getImprovements("ps", 11).times(tmp.ps.impr.power).pow(2.5)) },
				effectDisplay() { return format(tmp.ps.impr[12].effect)+"x" },
				formula: "10^(x^2.5)",
				style: {height: "150px", width: "150px"},
			},
			21: {
				num: 3,
				title: "幽魂增幅器 III",
				description: "加成魔法效果。",
				unlocked() { return hasMilestone("hn", 7) },
				effect() { return getImprovements("ps", 21).times(tmp.ps.impr.power).div(10).plus(1) },
				effectDisplay() { return format(tmp.ps.impr[21].effect.sub(1).times(100))+"% 增强" },
				formula: "x*10%",
				style: {height: "150px", width: "150px"},
			},
			22: {
				num: 4,
				title: "幽魂增幅器 IV",
				description: "减缓诡异改良价格增长。",
				unlocked() { return hasMilestone("hn", 7) },
				effect() { return getImprovements("ps", 22).times(tmp.ps.impr.power).div(20).plus(1) },
				effectDisplay() { return format(tmp.ps.impr[22].effect)+"x 减缓" },
				formula: "x/20+1",
				style: {height: "150px", width: "150px"},
			},
			31: {
				num: 1500,
				title: "幽魂增幅器 V",
				description: "灵魂价格缩放减缓。",
				unlocked() { return hasMilestone("hn", 7) && player.i.buyables[14].gte(1) },
				effect() { return getImprovements("ps", 31).times(tmp.ps.impr.power).plus(1).log10().div(25).plus(1) },
				effectDisplay() { return "减缓 " + format(Decimal.sub(1, tmp.ps.impr[31].effect.pow(-1)).times(100))+"%" },
				formula: "log(x+1)/25+1",
				style: {height: "150px", width: "150px"},
			},
			32: {
				num: 1751,
				title: "幽魂增幅器 VI",
				description: "幽魂降低幽魂价格底数。",
				unlocked() { return hasMilestone("hn", 7) && player.i.buyables[14].gte(2) },
				effect() { return getImprovements("ps", 31).times(tmp.ps.impr.power).pow(2).times(player.ps.points).plus(1).log10().plus(1).pow(1.2) },
				effectDisplay() { return "降低至 "+format(tmp.ps.impr[32].effect)+" 次根" },
				formula: "(log((x^2)*PS+1)+1)^1.2",
				style: {height: "150px", width: "150px"},
			},
		},
})
/*
                                      
                                      
hhhhhhh                               
h:::::h                               
h:::::h                               
h:::::h                               
 h::::h hhhhh       nnnn  nnnnnnnn    
 h::::hh:::::hhh    n:::nn::::::::nn  
 h::::::::::::::hh  n::::::::::::::nn 
 h:::::::hhh::::::h nn:::::::::::::::n
 h::::::h   h::::::h  n:::::nnnn:::::n
 h:::::h     h:::::h  n::::n    n::::n
 h:::::h     h:::::h  n::::n    n::::n
 h:::::h     h:::::h  n::::n    n::::n
 h:::::h     h:::::h  n::::n    n::::n
 h:::::h     h:::::h  n::::n    n::::n
 h:::::h     h:::::h  n::::n    n::::n
 hhhhhhh     hhhhhhh  nnnnnn    nnnnnn
                                      
                                      
                                      
                                      
                                      
                                      
                                      
*/
addLayer("hn", {
		name: "honour", // This is optional, only used in a few places, If absent it just uses the layer id.
        symbol: "HN", // This appears on the layer's node. Default is the id with the first letter capitalized
        position: 2, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
        startData() { return {
            unlocked: false,
			points: new Decimal(0),
			best: new Decimal(0),
			total: new Decimal(0),
			first: 0,
        }},
        color: "#ffbf00",
		nodeStyle() {return {
			"background-color": (((player.hn.unlocked||canReset("hn"))&&!(Array.isArray(tmp.ma.canBeMastered)&&player.ma.selectionActive&&tmp[this.layer].row<tmp.ma.rowLimit&&!tmp.ma.canBeMastered.includes(this.layer)))?"#ffbf00":"#bf8f8f"),
        }},
        resource: "荣耀", // Name of prestige currency
        type: "custom", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
		baseResource: "魔法和平衡",
		baseAmount() { return new Decimal(0) },
		req: {m: new Decimal(1e150), ba: new Decimal(1e179)},
		requires() { return this.req },
		exp() { return {m: new Decimal(0.025), ba: new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?0.05:0.02)} },
		exponent() { return tmp[this.layer].exp },
		gainMult() {
			let mult = new Decimal(1);
			if (player.n.buyables[11].gte(1)) mult = mult.times(buyableEffect("o", 22));
			if (hasAchievement("a", 91)) mult = mult.times(1.1);
			if (hasUpgrade("g", 35) && player.i.buyables[12].gte(2)) mult = mult.times(upgradeEffect("g", 35));
			if (hasUpgrade("s", 35) && player.i.buyables[12].gte(5)) mult = mult.times(upgradeEffect("s", 35));
			if (player.ma.unlocked) mult = mult.times(tmp.ma.effect);
			return mult;
		},
		getResetGain() {
			let gain = player.m.points.div(tmp.hn.req.m).pow(tmp.hn.exp.m).times(player.ba.points.div(tmp.hn.req.ba).pow(tmp.hn.exp.ba));
			if (gain.gte(1e5)) gain = softcap("HnG", gain);
			return gain.times(tmp.hn.gainMult).floor();
		},
		resetGain() { return this.getResetGain() },
		getNextAt() {
			let gain = tmp.hn.getResetGain.div(tmp.hn.gainMult)
			gain = reverse_softcap("HnG", gain).plus(1);
			let next = {m: gain.sqrt().root(tmp.hn.exp.m).times(tmp.hn.req.m), ba: gain.sqrt().root(tmp.hn.exp.ba).times(tmp.hn.req.ba)};
			return next;
		},
		passiveGeneration() { return (hasMilestone("ma", 1)&&player.ma.current!="hn")?1:0 },
		canReset() {
			return player.m.points.gte(tmp.hn.req.m) && player.ba.points.gte(tmp.hn.req.ba) && tmp.hn.getResetGain.gt(0) 
		},
		dispGainFormula() {
			let vars = ["m", "ba"]
			let txt = "";
			for (let i=0;i<vars.length;i++) {
				let layer = vars[i];
				let start = tmp.hn.req[layer];
				let exp = tmp.hn.exp[layer];
				if (i>0) txt += ", "
				txt += layer.toUpperCase()+": (x / "+format(start)+")^"+format(exp)
			}
			return txt;
		},
		prestigeButtonText() {
			if (tmp.nerdMode) return "获取公式: "+tmp.hn.dispGainFormula;
			else return `${ player.hn.points.lt(1e3) ? (tmp.hn.resetDescription !== undefined ? tmp.hn.resetDescription : "重置获得 ") : ""}+<b>${formatWhole(tmp.hn.getResetGain)}</b> ${tmp.hn.resource} ${tmp.hn.resetGain.lt(100) && player.hn.points.lt(1e3) ? `<br><br>下一个需要 ${ ('魔法: '+format(tmp.hn.nextAt.m)+'，平衡: '+format(tmp.hn.nextAt.ba))}` : ""}`
		},
		prestigeNotify() {
			if (!canReset("hn")) return false;
			if (tmp.hn.getResetGain.gte(player.hn.points.times(0.1).max(1)) && !tmp.hn.passiveGeneration) return true;
			else return false;
		},
		tooltip() { return formatWhole(player.hn.points)+" 荣耀" },
		tooltipLocked() { return "达到 "+formatWhole(tmp.hn.req.m)+" 魔法 & "+formatWhole(tmp.hn.req.ba)+" 平衡解锁 (你有 "+formatWhole(player.m.points)+" 魔法 & "+formatWhole(player.ba.points)+" 平衡)" },
        row: 5, // Row the layer is in on the tree (0 is the first row)
        hotkeys: [
            {key: "H", description: "按 Shift+H 进行荣耀重置。", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
        ],
        doReset(resettingLayer){ 
			let keep = [];
			if (hasMilestone("ma", 1)) {
				keep.push("milestones")
				keep.push("upgrades")
			}
			if (layers[resettingLayer].row > this.row) layerDataReset(this.layer, keep)
        },
        layerShown(){return player.m.unlocked&&player.ba.unlocked },
        branches: ["m","ba"],
		tabFormat: ["main-display",
			"prestige-button",
			"resource-display",
			["display-text", function() { return player.hn.unlocked?("你有 "+formatWhole(player.p.points)+" 声望"):"" }],
			"blank",
			"milestones",
			"blank",
			"upgrades"
		],
		milestones: {
			0: {
				requirementDescription: "1 总荣耀",
				done() { return player.hn.total.gte(1) },
				effectDescription: "永远保留所有魔法和平衡里程碑。",
			},
			1: {
				requirementDescription: "2 总荣耀",
				done() { return player.hn.total.gte(2) },
				effectDescription: "每秒获得 100% 魔法和平衡。",
			},
			2: {
				requirementDescription: "3 总荣耀",
				done() { return player.hn.total.gte(3) },
				effectDescription: "平衡滑条以认为其同时处在两边的方式运作，解锁自动施法。",
				toggles: [["m", "auto"]],
			},
			3: {
				requirementDescription: "4 总荣耀",
				done() { return player.hn.total.gte(4) },
				effectDescription: "解锁最大购买子空间能量，对所有重置保留平衡升级。",
			},
			4: {
				requirementDescription: "5 总荣耀",
				done() { return player.hn.total.gte(5) },
				effectDescription: "购买幽灵不再消耗恶魂和幽魂，解锁自动幽魂。",
				toggles: [["ps", "auto"]],
			},
			5: {
				requirementDescription: "6 总荣耀",
				done() { return player.hn.total.gte(6) },
				effectDescription: "解锁自动幽灵。",
				toggles: [["ps", "autoW"]],
			},
			6: {
				requirementDescription: "10 总荣耀",
				done() { return player.hn.total.gte(10) },
				effectDescription: "幽魂不再重置任何东西。",
			},
			7: {
				requirementDescription: "100,000 总荣耀 & e11,000,000 声望",
				unlocked() { return hasMilestone("hn", 6) },
				done() { return player.hn.total.gte(1e5) && player.p.points.gte("e11000000") },
				effectDescription: "解锁幽魂增幅器和更多荣耀升级。",
			},
			8: {
				requirementDescription: "1e30 总荣耀",
				unlocked() { return hasMilestone("hn", 7) && hasUpgrade("hn", 15) },
				done() { return player.hn.total.gte(1e30) },
				effectDescription: "你可以同时激活 3 个二级星尘。",
			},
			9: {
				requirementDescription: "1e300 总荣耀",
				unlocked() { return hasMilestone("hn", 8) },
				done() { return player.hn.total.gte(1e300) },
				effectDescription: "允许最大购买幽魂。",
			},
		},
		upgrades: {
			rows: 5,
			cols: 5,
			11: {
				title: "重新开始",
				description: "解锁新的声望升级",
				multiRes: [
					{
						cost() { return new Decimal(player.ma.current=="hn"?"1e1000":4) },
					},
					{
						currencyDisplayName: "声望",
						currencyInternalName: "points",
						currencyLayer: "p",
						cost() { return new Decimal(player.ma.current=="hn"?"ee10":"1e4000000") },
					},
				],
				unlocked() { return player.hn.unlocked && hasUpgrade("p", 11) },
			},
			12: {
				title: "荣耀增益",
				description: "总荣耀推迟 <b>声望增益</b> 软上限。",
				multiRes: [
					{
						cost() { return new Decimal(player.ma.current=="hn"?"1e6800":1) },
					},
					{
						currencyDisplayName: "声望",
						currencyInternalName: "points",
						currencyLayer: "p",
						cost() { return new Decimal(player.ma.current=="hn"?"e4.175e10":"1e1000000") },
					},
				],
				unlocked() { return player.hn.unlocked && hasUpgrade("p", 12) },
				effect() { return softcap("hn12", player.hn.total.plus(1).pow(1e4)) },
				effectDisplay() { return format(tmp.hn.upgrades[12].effect)+"x 推迟" },
				formula: "(x+1)^1e4",
			},
			13: {
				title: "自自协同",
				description: "<b>自协同</b> 效果提高。",
				multiRes: [
					{
						cost() { return new Decimal(player.ma.current=="hn"?"1e7000":2) },
					},
					{
						currencyDisplayName: "声望",
						currencyInternalName: "points",
						currencyLayer: "p",
						cost() { return new Decimal(player.ma.current=="hn"?"e4.5e10":"1e3900000") },
					},
				],
				unlocked() { return player.hn.unlocked && hasUpgrade("p", 13) },
				effect() { return tmp.p.upgrades[13].effect.max(1).log10().plus(1).log10().times(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes("hn"):false)?200:40).plus(1) },
				effectDisplay() { return "^"+format(tmp.hn.upgrades[13].effect) },
				formula: "log(log(x+1)+1)*40+1",
			},
			14: {
				title: "不冷静",
				description: "<b>声望强度</b> 效果增强 5%。",
				multiRes: [
					{
						cost() { return new Decimal(player.ma.current=="hn"?"1e7010":1e5) },
					},
					{
						currencyDisplayName: "声望",
						currencyInternalName: "points",
						currencyLayer: "p",
						cost() { return new Decimal(player.ma.current=="hn"?"e4.55e10":"1e11000000") },
					},
				],
				unlocked() { return player.hn.unlocked && hasUpgrade("p", 14) && hasMilestone("hn", 7) },
			},
			15: {
				title: "光速黑洞",
				description: "你现在可以同时激活两个二级星尘。",
				multiRes: [
					{
						cost: new Decimal(3.5e10),
					},
					{
						currencyDisplayName: "声望",
						currencyInternalName: "points",
						currencyLayer: "p",
						cost: new Decimal("1e30000000"),
					},
				],
				unlocked() { return hasUpgrade("hn", 53) && hasUpgrade("hn", 54) && player.n.unlocked },
			},
			21: {
				title: "点数效率",
				description: "妖术减弱 <b>声望增益</b> 软上限。",
				multiRes: [
					{
						cost() { return new Decimal(player.ma.current=="hn"?"1e7025":25) },
					},
					{
						currencyDisplayName: "声望",
						currencyInternalName: "points",
						currencyLayer: "p",
						cost() { return new Decimal(player.ma.current=="hn"?"e4.58e10":"1e4700000") },
					},
				],
				unlocked() { return player.hn.unlocked && hasUpgrade("p", 21) },
				cap() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes("hn"):false)?.92:.9) },
				effect() { return player.m.hexes.plus(1).log10().plus(1).log10().times(0.15).min(tmp.hn.upgrades[this.id].cap) },
				effectDisplay() { return format(tmp.hn.upgrades[21].effect.times(100))+"% 变弱"+(tmp.hn.upgrades[21].effect.gte(tmp.hn.upgrades[this.id].cap)?" (已满)":"") },
				formula() { return "log(log(x+1)+1)*15, 最多 "+format(tmp.hn.upgrades[this.id].cap.times(100))+"%" },
			},
			22: {
				title: "超级升级",
				description: "幽灵增强 <b>力量升级</b> 效果。",
				multiRes: [
					{
						cost() { return new Decimal(player.ma.current=="hn"?"1e12640":4) },
					},
					{
						currencyDisplayName: "声望",
						currencyInternalName: "points",
						currencyLayer: "p",
						cost() { return new Decimal(player.ma.current=="hn"?"e6e11":"1e4000000") },
					},
				],
				unlocked() { return player.hn.unlocked && hasUpgrade("p", 22) },
				effect() { return Decimal.pow(10, player.ps.souls.plus(1).log10().plus(1).log10().sqrt().times(5)).times(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes("hn"):false)?3:1) },
				effectDisplay() { return "^"+format(tmp.hn.upgrades[22].effect) },
				formula: "10^(sqrt(log(log(x+1)+1))*5)",
			},
			23: {
				title: "反转强化",
				description: "平衡加成 <b>翻转声望增益</b> 效果。",
				multiRes: [
					{
						cost() { return new Decimal(player.ma.current=="hn"?"1e12625":100) },
					},
					{
						currencyDisplayName: "声望",
						currencyInternalName: "points",
						currencyLayer: "p",
						cost() { return new Decimal(player.ma.current=="hn"?"e6e11":"1e5400000") },
					},
				],
				unlocked() { return player.hn.unlocked && hasUpgrade("p", 23) },
				effect() { return player.ba.points.plus(1).log10().plus(1).pow(.75).times(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes("hn"):false)?1.1:1) },
				effectDisplay() { return "^"+format(tmp.hn.upgrades[23].effect) },
				formula: "(log(x+1)+1)^0.75",
			},
			24: {
				title: "日冕能量",
				description: "日冕波动的两个效果翻倍（不受软上限影响）。",
				multiRes: [
					{
						cost() { return new Decimal(player.ma.current=="hn"?"1e12645":1.5e5) },
					},
					{
						currencyDisplayName: "声望",
						currencyInternalName: "points",
						currencyLayer: "p",
						cost() { return new Decimal(player.ma.current=="hn"?"e6.05e11":"1e12000000") },
					},
				],
				unlocked() { return player.hn.unlocked && hasUpgrade("p", 24) && hasMilestone("hn", 7) },
			},
			25: {
				title: "聚爆超新星",
				description: "超空间能量和星云加成阳光获取指数和星尘获取。",
				multiRes: [
					{
						cost: new Decimal(5e10),
					},
					{
						currencyDisplayName: "声望",
						currencyInternalName: "points",
						currencyLayer: "p",
						cost: new Decimal("1e32500000"),
					},
				],
				unlocked() { return hasUpgrade("hn", 53) && hasUpgrade("hn", 54) && player.n.unlocked && player.hs.unlocked },
				effect() { return player.hs.points.times(player.n.points.pow(3)).plus(1).log10().plus(1).log10().plus(1) },
				effectDisplay() { return format(tmp.hn.upgrades[25].effect)+"x" },
				formula: "log(log(HS*(N^3)+1)+1)+1",
				style: {"font-size": "9px"},
			},
			31: {
				title: "指数漂移",
				description: "点数获取提升至 1.05 次幂。",
				multiRes: [
					{
						cost() { return new Decimal(player.ma.current=="hn"?"1e12650":64) },
					},
					{
						currencyDisplayName: "声望",
						currencyInternalName: "points",
						currencyLayer: "p",
						cost() { return new Decimal(player.ma.current=="hn"?"e6.06e11":"1e5600000") },
					},
				],
				unlocked() { return player.hn.unlocked && hasUpgrade("p", 31) },
			},
			32: {
				title: "更少无用",
				description: "<b>力量升级</b> 提升至 7 次幂。",
				multiRes: [
					{
						cost() { return new Decimal(player.ma.current=="hn"?"1e12800":1e4) },
					},
					{
						currencyDisplayName: "声望",
						currencyInternalName: "points",
						currencyLayer: "p",
						cost() { return new Decimal(player.ma.current=="hn"?"e6.3e11":"1e10250000") },
					},
				],
				unlocked() { return player.hn.unlocked && hasUpgrade("p", 32) },
			},
			33: {
				title: "列长长",
				description: "最多荣耀加成 <b>列长</b> 效果。",
				multiRes: [
					{
						cost() { return new Decimal(player.ma.current=="hn"?"1e12900":500) },
					},
					{
						currencyDisplayName: "声望",
						currencyInternalName: "points",
						currencyLayer: "p",
						cost() { return new Decimal(player.ma.current=="hn"?"e6.325e11":"1e6900000") },
					},
				],
				unlocked() { return player.hn.unlocked && hasUpgrade("p", 33) },
				effect() { return Decimal.pow(10, player.hn.best.plus(1).log10().plus(1).log10().sqrt()).times(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes("hn"):false)?1.1:1) },
				effectDisplay() { return format(tmp.hn.upgrades[33].effect)+"x" },
				formula: "10^sqrt(log(log(x+1)+1))",
			},
			34: {
				title: "太阳活跃",
				description: "总荣耀加成 <b>阳光潜能</b> 效果。",
				multiRes: [
					{
						cost() { return new Decimal(player.ma.current=="hn"?"1e12820":5e5) },
					},
					{
						currencyDisplayName: "声望",
						currencyInternalName: "points",
						currencyLayer: "p",
						cost() { return new Decimal(player.ma.current=="hn"?"e6.32e11":"1e12500000") },
					},
				],
				unlocked() { return player.hn.unlocked && hasUpgrade("p", 34) && hasMilestone("hn", 7) },
				effect() { return player.hn.total.plus(1).log10().plus(1).log10().plus(1).log10().plus(1) },
				effectDisplay() { return format(tmp.hn.upgrades[34].effect)+"x" },
				formula: "log(log(log(x+1)+1)+1)+1",
			},
			35: {
				title: "不致死",
				description: "紫尘蓝尘加成子空间底数。",
				multiRes: [
					{
						cost: new Decimal(1.5e13),
					},
					{
						currencyDisplayName: "声望",
						currencyInternalName: "points",
						currencyLayer: "p",
						cost: new Decimal("1e40000000"),
					},
				],
				unlocked() { return hasUpgrade("hn", 53) && hasUpgrade("hn", 54) && player.n.unlocked },
				effect() { return player.n.purpleDust.times(player.n.blueDust).plus(1).pow(10) },
				effectDisplay() { return format(tmp.hn.upgrades[35].effect)+"x" },
				formula: "(B*P+1)^10",
			},
			41: {
				title: "一次又一次",
				description: "魂力加成 <b>声望递归</b> 效果。",
				multiRes: [
					{
						cost() { return new Decimal(player.ma.current=="hn"?"1e13050":1e5) },
					},
					{
						currencyDisplayName: "声望",
						currencyInternalName: "points",
						currencyLayer: "p",
						cost() { return new Decimal(player.ma.current=="hn"?"e6.75e11":"1e11000000") },
					},
				],
				unlocked() { return player.hn.unlocked && hasUpgrade("p", 41) && hasMilestone("hn", 7) },
				effect() { return player.ps.power.plus(1).log10().plus(1).log10().times(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes("hn"):false)?4.8:2.4).plus(1) },
				effectDisplay() { return "^"+format(tmp.hn.upgrades[41].effect) },
				formula: "log(log(x+1)+1)*2.4+1",
				style: {"font-size": "9px"},
			},
			42: {
				title: "空间感知 II",
				description: "建筑价格减缓 20%。",
				multiRes: [
					{
						cost() { return new Decimal(player.ma.current=="hn"?"1e13100":1.5e5) },
					},
					{
						currencyDisplayName: "声望",
						currencyInternalName: "points",
						currencyLayer: "p",
						cost() { return new Decimal(player.ma.current=="hn"?"e6.8e11":"1e12000000") },
					},
				],
				unlocked() { return player.hn.unlocked && hasUpgrade("p", 42) && hasMilestone("hn", 7) },
			},
			43: {
				title: "诅咒",
				description: "QE 加成诡异获取。",
				multiRes: [
					{
						cost() { return new Decimal(player.ma.current=="hn"?"1e14300":5e5) },
					},
					{
						currencyDisplayName: "声望",
						currencyInternalName: "points",
						currencyLayer: "p",
						cost() { return new Decimal(player.ma.current=="hn"?"e6.9e11":"1e12500000") },
					},
				],
				unlocked() { return player.hn.unlocked && hasUpgrade("p", 43) && hasMilestone("hn", 7) },
				effect() { return Decimal.pow(10, tmp.q.enEff.max(1).log10().root(1.8)).pow(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes("hn"):false)?50:1) },
				effectDisplay() { return format(tmp.hn.upgrades[43].effect)+"x" },
				formula() { return "10^(log(quirkEnergyEff)^"+((hasUpgrade("t", 35) && player.i.buyables[12].gte(4))?"0.565":"0.556")+")" },
			},
			44: {
				title: "数字词典",
				description: "<b>法术词典</b> 同样影响 <b>实体重生</b>（平衡升级）的效果（不受软上限影响）。",
				multiRes: [
					{
						cost() { return new Decimal(player.ma.current=="hn"?"1e14275":5e5) },
					},
					{
						currencyDisplayName: "声望",
						currencyInternalName: "points",
						currencyLayer: "p",
						cost() { return new Decimal(player.ma.current=="hn"?"e6.95e11":"1e12500000") },
					},
				],
				unlocked() { return player.hn.unlocked && hasUpgrade("p", 44) && hasMilestone("hn", 7) },
				style: {"font-size": "8px"},
			},
			45: {
				title: "冰箱下面",
				description: "蓝尘橙尘加成星云获取。",
				multiRes: [
					{
						cost: new Decimal(1e14),
					},
					{
						currencyDisplayName: "声望",
						currencyInternalName: "points",
						currencyLayer: "p",
						cost: new Decimal("1e42500000"),
					},
				],
				unlocked() { return hasUpgrade("hn", 53) && hasUpgrade("hn", 54) && player.n.unlocked },
				effect() { return player.n.blueDust.times(player.n.orangeDust).plus(1).log10().plus(1).pow(3) },
				effectDisplay() { return format(tmp.hn.upgrades[45].effect)+"x" },
				formula: "(log(B*O+1)+1)^3",
			},
			51: {
				title: "潜影",
				description: "总荣耀降低灵魂价格，同时灵魂价格增长减缓。",
				multiRes: [
					{
						cost() { return new Decimal(player.ma.current=="hn"?"1e14500":1e6) },
					},
					{
						currencyDisplayName: "声望",
						currencyInternalName: "points",
						currencyLayer: "p",
						cost() { return new Decimal(player.ma.current=="hn"?"e6.975e11":"1e12800000") },
					},
				],
				unlocked() { return player.hn.upgrades.length>=16 },
				effect() { return player.hn.total.plus(1).pow(5) },
				effectDisplay() { return "/"+format(tmp.hn.upgrades[51].effect) },
				formula: "(x+1)^5",
				style: {"font-size": "8px"},
			},
			52: {
				title: "循环生长",
				description: "<b>差旋层电浆</b> 加成超级生成器底数。",
				multiRes: [
					{
						cost() { return new Decimal(player.ma.current=="hn"?"1e30000":1e7) },
					},
					{
						currencyDisplayName: "声望",
						currencyInternalName: "points",
						currencyLayer: "p",
						cost() { return new Decimal(player.ma.current=="hn"?"e7.5e11":"e16000000") },
					},
				],
				unlocked() { return player.hn.upgrades.length>=16 && (player.n.unlocked||player.hs.unlocked) },
				style: {"font-size": "9px"},
			},
			53: {
				title: "星云亮度",
				description: "解锁 3 个星尘效果，但你只能选择其中一个激活，在第六行重置时保留星尘。",
				multiRes: [
					{
						cost() { return new Decimal(player.ma.current=="hn"?"1e40000":2.5e7) },
					},
					{
						currencyDisplayName: "声望",
						currencyInternalName: "points",
						currencyLayer: "p",
						cost: new Decimal("e17250000"),
					},
				],
				unlocked() { return hasUpgrade("hn", 52) && player.n.unlocked },
				style: {"font-size": "9px"},
			},
			54: {
				title: "超速杰作",
				description: "总超空间能量加成超建筑效果。",
				multiRes: [
					{
						cost() { return new Decimal(player.ma.current=="hn"?"1e40000":2.5e7) },
					},
					{
						currencyDisplayName: "声望",
						currencyInternalName: "points",
						currencyLayer: "p",
						cost: new Decimal("e17250000"),
					},
				],
				unlocked() { return hasUpgrade("hn", 52) && player.hs.unlocked },
				style: {"font-size": "9px"},
				effect() { return player.hs.total.pow(2).plus(1).log10().plus(1).log10().plus(1).log10().times(4).plus(1) },
				effectDisplay() { return format(tmp.hn.upgrades[54].effect.sub(1).times(100))+"% 强化" },
				formula: "log(log(log(x^2+1)+1)+1)*400",
			},
			55: {
				title: "阳光之下",
				description: "橙尘紫尘加成太阳能。",
				multiRes: [
					{
						cost: new Decimal(2.5e14),
					},
					{
						currencyDisplayName: "声望",
						currencyInternalName: "points",
						currencyLayer: "p",
						cost: new Decimal("1e45000000"),
					},
				],
				unlocked() { return hasUpgrade("hn", 53) && hasUpgrade("hn", 54) && player.n.unlocked },
				effect() { return player.n.orangeDust.times(player.n.purpleDust).plus(1).log10() },
				effectDisplay() { return "+"+format(tmp.hn.upgrades[55].effect.times(100))+"%" },
				formula: "log(O*P+1)*100",
			},
		},
})
/*
                  
                  
                  
                  
                  
                  
nnnn  nnnnnnnn    
n:::nn::::::::nn  
n::::::::::::::nn 
nn:::::::::::::::n
  n:::::nnnn:::::n
  n::::n    n::::n
  n::::n    n::::n
  n::::n    n::::n
  n::::n    n::::n
  n::::n    n::::n
  n::::n    n::::n
  nnnnnn    nnnnnn
                  
                  
                  
                  
                  
                  
                  
*/
addLayer("n", {
		name: "nebula", // This is optional, only used in a few places, If absent it just uses the layer id.
        symbol: "T", // This appears on the layer's node. Default is the id with the first letter capitalized
        position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
        startData() { return {
            unlocked: false,
			points: new Decimal(0),
			best: new Decimal(0),
			total: new Decimal(0),
			purpleDust: new Decimal(0),
			blueDust: new Decimal(0),
			orangeDust: new Decimal(0),
			activeSecondaries: {purpleBlue: false, blueOrange: false, orangePurple: false},
			first: 0,
        }},
        color: "#d28e8e",
		nodeStyle() { return {
			"background-color": (((player.n.unlocked||canReset("n"))&&!(Array.isArray(tmp.ma.canBeMastered)&&player.ma.selectionActive&&tmp[this.layer].row<tmp.ma.rowLimit&&!tmp.ma.canBeMastered.includes(this.layer)))?"#d28e8e":"#c5d28e"),
			color: (player.oldStyle?"white":"rgba(255, 255, 255, 0.75)"),
		}},
		componentStyles() { return {
			"prestige-button": {
				color: (player.oldStyle?"white":"rgba(255, 255, 255, 0.75)"),
			},
		}},
        requires() { return new Decimal((player[this.layer].unlockOrder>0&&!hasAchievement("a", 92))?"1e288":"1e280") }, // Can be a function that takes requirement increases into account
		increaseUnlockOrder: ["hs"],
        resource: "星云", // Name of prestige currency
        baseResource: "阳光", // Name of resource prestige is based on
        baseAmount() {return player.o.points}, // Get the current amount of baseResource
        type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
        exponent() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?0.05:0.03) }, // Prestige currency exponent
        gainMult() { // Calculate the multiplier for main currency from bonuses
            mult = new Decimal(1);
			if (hasUpgrade("hn", 45)) mult = mult.times(upgradeEffect("hn", 45));
			if (hasUpgrade("g", 35) && player.i.buyables[12].gte(2)) mult = mult.times(upgradeEffect("g", 35));
			if (hasUpgrade("s", 33) && player.i.buyables[12].gte(5)) mult = mult.times(upgradeEffect("s", 33));
			if (hasUpgrade("q", 45) && player.i.buyables[12].gte(6)) mult = mult.times(200);
			if (player.ge.unlocked) mult = mult.times(tmp.ge.rotEff);
			if ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes("i"):false) mult = mult.times(Decimal.pow(10, player.i.nb));
			if (hasUpgrade("ai", 24)) mult = mult.times(upgradeEffect("ai", 24));
            return mult
        },
		passiveGeneration() { return (hasMilestone("ma", 3)&&player.ma.current!="n")?1:0 },
        gainExp() { // Calculate the exponent on main currency from bonuses
            return new Decimal(1)
        },
        row: 5, // Row the layer is in on the tree (0 is the first row)
        hotkeys: [
            {key: "n", description: "按 N 进行星云重置", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
        ],
        doReset(resettingLayer){ 
			let keep = [];
			if (!hasUpgrade("hn", 53)) {
				player.n.purpleDust = new Decimal(0);
				player.n.blueDust = new Decimal(0);
				player.n.orangeDust = new Decimal(0);
			}
			if (layers[resettingLayer].row == 6 && hasMilestone("ma", 0)) keep.push("buyables");
			let as = JSON.parse(JSON.stringify(player.n.activeSecondaries));
			if (layers[resettingLayer].row > this.row) layerDataReset(this.layer, keep);
			if (hasMilestone("ma", 0)) player.n.activeSecondaries = as;
        },
        layerShown(){return player.o.unlocked && player.hn.unlocked },
        branches: ["o", ["ps", 2]],
		tabFormat() { 
			let second = !(!tmp.n.secondariesAvailable);
			
			return ["main-display",
			"prestige-button",
			"resource-display",
			"blank",
			["column", 
				[(second?["clickable", 14]:[]),
				
				"blank",
				
				["display-text", (player.ma.unlocked?("尘积: "+format(tmp.n.dustProduct)):"") ],
				
				"blank",
			
				["row", [["display-text", ("<span style='color: #bd6afc; font-size: 24px'>"+format(player.n.purpleDust)+"</span> 紫尘"+(tmp.nerdMode?" (获取公式: (x^0.333)*"+format(tmp.n.dustGainMult.div(20))+")":((tmp.n.effect.purple||new Decimal(1)).lt("1e1000")?(" (+"+format(tmp.n.effect.purple||new Decimal(1))+"/sec)"):""))+"<br><br>增幅恶魂和魂力获取 <span style='color: #bd6afc; font-size: 24px'>"+format(tmp.n.dustEffs.purple)+"x</span>"+(tmp.nerdMode?" (效果公式: 10^sqrt(log(x+1)))":""))]], {"background-color": "rgba(189, 106, 252, 0.25)", width: "50vw", padding: "10px", margin: "0 auto"}],
				
				(second?["column", [["clickable", 11], ["display-text", ("加成魔法获取 <span style='color: #ee82ee; font-size: 24px'>"+format(tmp.n.dustEffs2.purpleBlue)+"x</span>"+(tmp.nerdMode?" (效果公式: (purple*blue+1)^10)":" (基于紫尘蓝尘)"))]], {"background-color": "rgba(238, 130, 238, 0.25)", width: "50vw", padding: "10px", margin: "0 auto"}]:[]),
				
				["row", [["display-text", ("<span style='color: #7569ff; font-size: 24px'>"+format(player.n.blueDust)+"</span> 蓝尘"+(tmp.nerdMode?" (获取公式: (x^0.5)*"+format(tmp.n.dustGainMult.div(1e3))+")":((tmp.n.effect.blue||new Decimal(1)).lt("1e1000")?(" (+"+format(tmp.n.effect.blue||new Decimal(1))+"/sec)"):""))+"<br><br>加成超级增幅器底数 <span style='color: #7569ff; font-size: 24px'>"+format(tmp.n.dustEffs.blue)+"x</span>"+(tmp.nerdMode?" (效果公式: (x+1)^50)":""))]], {"background-color": "rgba(117, 105, 255, 0.25)", width: "50vw", padding: "10px", margin: "0 auto"}],
				
				(second?["column", [["clickable", 12], ["display-text", ("加成 <b>永恒</b> 和 <b>D 选项</b> 效果 <span style='color: #ba9397; font-size: 24px'>"+format(tmp.n.dustEffs2.blueOrange)+"x</span><br>(不受软上限影响)"+(tmp.nerdMode?" (效果公式: (blue*orange+1)^5)":" (基于蓝尘橙尘)"))]], {"background-color": "rgba(186, 147, 151, 0.25)", width: "50vw", padding: "10px", margin: "0 auto"}]:[]),
				
				["row", [["display-text", ("<span style='color: #ffbd2e; font-size: 24px'>"+format(player.n.orangeDust)+"</span> 橙尘"+(tmp.nerdMode?" (获取公式: (x^0.2)*"+format(tmp.n.dustGainMult.div(5))+")":((tmp.n.effect.orange||new Decimal(1)).lt("1e1000")?(" (+"+format(tmp.n.effect.orange||new Decimal(1))+"/sec)"):""))+"<br><br> 加成所有阳光购买项数量 <span style='color: #ffbd2e; font-size: 24px'>"+format(tmp.n.dustEffs.orange)+"x</span>"+(tmp.nerdMode?" (效果公式: (x+1)^75)":""))]], {"background-color": "rgba(255, 189, 46, 0.25)", width: "50vw", padding: "10px", margin: "0 auto"}],
				
				(second?["column", [["clickable", 13], ["display-text", ("加成时间胶囊上限底数 <span style='color: #94de95; font-size: 24px'>"+format(tmp.n.dustEffs2.orangePurple)+"x</span><br>"+(tmp.nerdMode?" (效果公式: (orange*purple+1)^0.6)":" (基于橙尘紫尘)"))]], {"background-color": "rgba(148, 222, 149, 0.25)", width: "50vw", padding: "10px", margin: "0 auto"}]:[]),
			]],
			"blank", "blank", ["buyable", 11], "blank", "blank",
		]},
		dustGainMult() {
			let mult = new Decimal(1);
			if (player.n.buyables[11].gte(1)) mult = mult.times(buyableEffect("o", 22));
			if (hasUpgrade("hn", 25)) mult = mult.times(upgradeEffect("hn", 25));
			if (hasUpgrade("g", 33) && player.i.buyables[12].gte(2)) mult = mult.times(upgradeEffect("g", 33));
			if (player.ge.unlocked) mult = mult.times(tmp.ge.rotEff);
			if ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false) mult = mult.times(1e30);
			return mult;
		},
		effect() {
			let amt = player.n.points;
			return {
				purple: amt.cbrt().div(20).times(tmp.n.dustGainMult),
				blue: amt.sqrt().div(1e3).times(tmp.n.dustGainMult),
				orange: amt.root(5).div(5).times(tmp.n.dustGainMult),
			};
		},
		dustProduct() { return player.n.purpleDust.times(player.n.blueDust).times(player.n.orangeDust) },
		dustEffs() {
			let mod = player.n.unlocked?1:0
			let exp = ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?1.6:1
			return {
				purple: Decimal.pow(10, player.n.purpleDust.times(mod).plus(1).log10().sqrt()).pow(exp),
				blue: player.n.blueDust.times(mod).plus(1).pow(50).pow(exp),
				orange: player.n.orangeDust.times(mod).plus(1).pow(75).pow(exp),
			}
		},
		dustEffs2() {
			let mod = hasUpgrade("hn", 53)?1:0
			let exp = ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?1.4:1
			return {
				purpleBlue: player.n.purpleDust.times(player.n.blueDust).plus(1).pow(10).pow(exp),
				blueOrange: player.n.blueDust.times(player.n.orangeDust).plus(1).pow(5).pow(exp),
				orangePurple: player.n.orangeDust.times(player.n.purpleDust).plus(1).pow(0.6).pow(exp),
			}
		},
		realDustEffs2() {
			let avail = player.n.activeSecondaries
			let data = tmp.n.dustEffs2;
			return {
				purpleBlue: avail.purpleBlue?data.purpleBlue:new Decimal(1),
				blueOrange: avail.blueOrange?data.blueOrange:new Decimal(1),
				orangePurple: avail.orangePurple?data.orangePurple:new Decimal(1),
			}
		},
		effectDescription: "产生下面的星尘",
		update(diff) {
			if (!player.n.unlocked) return;
			player.n.purpleDust = player.n.purpleDust.plus(tmp.n.effect.purple.times(diff));
			player.n.blueDust = player.n.blueDust.plus(tmp.n.effect.blue.times(diff));
			player.n.orangeDust = player.n.orangeDust.plus(tmp.n.effect.orange.times(diff));
		},
		buyables: {
			rows: 1,
			cols: 1,
			11: {
				title: "星团",
				cap() { return new Decimal(5) },
				cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
					let exp = (player.ma.current=="n")?26.5:1
					let cost = { purple: Decimal.pow(1e3, x.pow(2)).cbrt().times(50).pow(Math.pow(exp, 0.966)), blue: Decimal.pow(200, x.pow(2)).sqrt().pow(exp), orange: Decimal.pow(1e3, x.pow(2)).root(5).times(150).pow(exp) }
					return cost;
                },
				display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    let display = ((player[this.layer].buyables[this.id].gte(data.cap)?"已满":(("价格: " + formatWhole(data.cost.purple) + " 紫尘"+(tmp.nerdMode?" (公式: ((1e3^(x^2))^0.333)*50)":"")+"\n价格: "+formatWhole(data.cost.blue)+" 蓝尘"+(tmp.nerdMode?" (公式: ((200^(x^2))^0.5))":"")+"\n价格: "+formatWhole(data.cost.orange)+" 橙尘")+(tmp.nerdMode?" (公式: ((1e3^(x^2))^0.2)*150)":"")))+"\n\
                    数量: " + formatWhole(player[this.layer].buyables[this.id])+" / "+formatWhole(data.cap)+"\n\
					解锁 "+formatWhole(player[this.layer].buyables[this.id])+" 个阳光可购买项")
					return display;
                },
                unlocked() { return player[this.layer].unlocked }, 
                canAfford() {
					let cost = tmp[this.layer].buyables[this.id].cost
                    return player.n.unlocked && player.n.purpleDust.gte(cost.purple) && player.n.blueDust.gte(cost.blue) && player.n.orangeDust.gte(cost.orange) && player[this.layer].buyables[this.id].lt(tmp[this.layer].buyables[this.id].cap)},
                buy() { 
                    cost = tmp[this.layer].buyables[this.id].cost
					player.n.purpleDust = player.n.purpleDust.sub(cost.purple)
					player.n.blueDust = player.n.blueDust.sub(cost.blue)
					player.n.orangeDust = player.n.orangeDust.sub(cost.orange)
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                },
                buyMax() {
					// later :)
				},
                style() { return {'height':'200px', 'width':'200px', color:(tmp[this.layer].buyables[this.id].canAfford?"white":"black")}},
				autoed() { return false },
			},
		},
		secondariesAvailable() { return hasUpgrade("hn", 53)?((hasMilestone("hn", 8)&&player.ma.current!="n")?3:(hasUpgrade("hn", 15)?2:1)):0 },
		secondariesActive() { 
			let n = 0;
			Object.values(player.n.activeSecondaries).forEach(x => function() { n += x?1:0 }());
			return Math.min(n, layers.n.secondariesAvailable());
		},
		clickables: {
			rows: 1,
			cols: 4,
			11: {
				name: "purpleBlue",
				display() { return player.n.activeSecondaries[this.name]?"开":((!this.canClick())?"禁用":"关") },
				unlocked() { return tmp.n.secondariesAvailable>0 },
				canClick() { return (layers.n.secondariesActive()<layers.n.secondariesAvailable()) },
				onClick() { player.n.activeSecondaries[this.name] = true },
				style: {"height": "50px", "width": "50px", "background-color": "#ee82ee"},
			},
			12: {
				name: "blueOrange",
				display() { return player.n.activeSecondaries[this.name]?"开":((!this.canClick())?"禁用":"关") },
				unlocked() { return tmp.n.secondariesAvailable>0 },
				canClick() { return (layers.n.secondariesActive()<layers.n.secondariesAvailable()) },
				onClick() { player.n.activeSecondaries[this.name] = true },
				style: {"height": "50px", "width": "50px", "background-color": "#ba9397"},
			},
			13: {
				name: "orangePurple",
				display() { return player.n.activeSecondaries[this.name]?"开":((!this.canClick())?"禁用":"关") },
				unlocked() { return tmp.n.secondariesAvailable>0 },
				canClick() { return (layers.n.secondariesActive()<layers.n.secondariesAvailable()) },
				onClick() { player.n.activeSecondaries[this.name] = true },
				style: {"height": "50px", "width": "50px", "background-color": "#94de95"},
			},
			14: {
				display: "重置二级星尘效果（会进行一次星云重置）",
				unlocked() { return tmp.n.secondariesAvailable>0 },
				canClick() { return layers.n.secondariesActive()>0 },
				onClick() { 
					doReset("n", true);
					player.n.activeSecondaries = {purpleBlue: false, blueOrange: false, orangePurple: false}
				},
				style() { return {color: this.canClick()?"white":"black"}},
			},
		},
})
/*
                                     
                                     
hhhhhhh                              
h:::::h                              
h:::::h                              
h:::::h                              
 h::::h hhhhh           ssssssssss   
 h::::hh:::::hhh      ss::::::::::s  
 h::::::::::::::hh  ss:::::::::::::s 
 h:::::::hhh::::::h s::::::ssss:::::s
 h::::::h   h::::::h s:::::s  ssssss 
 h:::::h     h:::::h   s::::::s      
 h:::::h     h:::::h      s::::::s   
 h:::::h     h:::::hssssss   s:::::s 
 h:::::h     h:::::hs:::::ssss::::::s
 h:::::h     h:::::hs::::::::::::::s 
 h:::::h     h:::::h s:::::::::::ss  
 hhhhhhh     hhhhhhh  sssssssssss    
                                     
                                     
                                     
                                     
                                     
                                     
                                     
*/
addLayer("hs", {
		name: "hyperspace", // This is optional, only used in a few places, If absent it just uses the layer id.
        symbol: "HS", // This appears on the layer's node. Default is the id with the first letter capitalized
        position: 3, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
        startData() { return {
            unlocked: false,
			points: new Decimal(0),
			best: new Decimal(0),
			total: new Decimal(0),
			spentHS: new Decimal(0),
			buildLim: new Decimal(1),
			first: 0,
			auto: false,
        }},
		roundUpCost: true,
        color: "#dfdfff",
        requires() { return new Decimal((player[this.layer].unlockOrder>0&&!hasAchievement("a", 92))?420:360) }, // Can be a function that takes requirement increases into account
		increaseUnlockOrder: ["n"],
        resource: "超空间能量", // Name of prestige currency 
        baseResource: "空间能量", // Name of resource prestige is based on
        baseAmount() {return player.s.points}, // Get the current amount of baseResource
        type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
        exponent() { 
			let exp = new Decimal(60);
			if (player.i.buyables[11].gte(4)) exp = exp.times(buyableEffect("s", 19));
			return exp;
		}, // Prestige currency exponent
        gainMult() { // Calculate the multiplier for main currency from bonuses
            mult = new Decimal(1);
			if (hasUpgrade("g", 35) && player.i.buyables[12].gte(2)) mult = mult.times(upgradeEffect("g", 35));
			if (hasUpgrade("e", 41) && player.i.buyables[12].gte(3)) mult = mult.times(upgradeEffect("e", 41));
			if (hasUpgrade("t", 41) && player.i.buyables[12].gte(4)) mult = mult.times(2.5e3);
			if (hasUpgrade("s", 33) && player.i.buyables[12].gte(5)) mult = mult.times(upgradeEffect("s", 33));
			if (player.ma.unlocked) mult = mult.times(tmp.ma.effect);
			if ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes("i"):false) mult = mult.times(Decimal.pow(10, player.i.hb));
            return mult
        },
        gainExp() { // Calculate the exponent on main currency from bonuses
            return new Decimal(1)
        },
        row: 5, // Row the layer is in on the tree (0 is the first row)
        hotkeys: [
            {key: "ctrl+s", description: "按 Ctrl+S 进行超空间重置。", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
        ],
		passiveGeneration() { return (hasMilestone("ma", 2)&&player.ma.current!="hs")?1:0 },
        doReset(resettingLayer){ 
			let keep = [];
			let hs = player.hs.buyables[11];
			if (hasMilestone("ma", 2)) {
				keep.push("buyables");
				keep.push("spentHS");
			}
			if (layers[resettingLayer].row > this.row) layerDataReset(this.layer, keep)
			if (layers[resettingLayer].row == 6 && hasMilestone("ma", 0)) player.hs.buyables[11] = hs;
        },
        layerShown(){return player.ss.unlocked && player.hn.unlocked },
        branches: ["ss", "ba"],
		tabFormat: ["main-display",
			"prestige-button",
			"resource-display",
			["display-text", function() { return "你有 "+formatWhole(player.ba.points)+" 平衡" }],
			"blank",
			["buyable", 11],
			"blank", "blank",
			"respec-button",
			"blank",
			["display-text", function() { return tmp.hs.buildingPower.eq(1)?"":("超建筑增益: "+format(tmp.hs.buildingPower.times(100))+"%")}], "blank",
			["row", [["buyable", 21], ["buyable", 22], ["buyable", 23], ["buyable", 24], ["buyable", 25], ["buyable", 26], ["buyable", 27], ["buyable", 28], ["buyable", 29], ["buyable", 30]]],
			"blank",
			["display-text", function() { return "超建筑限制: "+formatWhole(player.hs.buildLim)+", 下一个: "+formatWhole(player.sg.points)+" / "+formatWhole(tmp.hs.nextBuildLimit)+" 超级生成器" }], "blank",
		],
		update(diff) {
			player.hs.buildLim = player.hs.buildLim.max(tmp.hs.buildLimit);
			if (hasMilestone("ma", 5) && player.hs.auto && player.ma.current!="hs") tmp.hs.buyables[11].buyMax();
		},
		hyperspace() {
			let total = player.hs.buyables[11];
			let amt = total.sub(player.hs.spentHS);
			return amt;
		},
		buildLimScaling() { return ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?0.8:1 },
		nextBuildLimit() { return player.hs.buildLim.plus(1).times(tmp.hs.buildLimScaling).pow(2).plus(20) },
		buildLimit() { return player.sg.points.sub(21).max(0).plus(1).sqrt().div(tmp.hs.buildLimScaling).floor() },
		buildingPower() {
			if (!unl(this.layer)) return new Decimal(0);
			let pow = new Decimal(1)
			if (hasUpgrade("hn", 54)) pow = pow.times(upgradeEffect("hn", 54));
			if (player.n.buyables[11].gte(5)) pow = pow.plus(buyableEffect("o", 33));
			if (player.i.buyables[11].gte(5)) pow = pow.plus(buyableEffect("s", 20));
			if (player.ma.unlocked) pow = pow.plus(tmp.ma.effect.max(1).log10().div(40));
			if (hasAchievement("a", 113)) pow = pow.plus(.1);
			if ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false) pow = pow.plus(player.hs.buyables[11].div(1000))
			if (player.c.unlocked && tmp.c) pow = pow.plus(tmp.c.eff1);
			return pow;
		},
		buyables: {
			rows: 2,
			cols: 10,
			showRespec() { return player.hs.unlocked },
            respec() { // Optional, reset things and give back your currency. Having this function makes a respec button appear
				player.hs.spentHS = new Decimal(0);
				let totalHS = player[this.layer].buyables[11]
                resetBuyables(this.layer)
				player[this.layer].buyables[11] = totalHS;
                doReset(this.layer, true) // Force a reset
            },
            respecText: "重置超建筑", // Text on Respec button, optional
			11: {
				title: "超空间",
				scaleRate() {
					let rate = new Decimal(1);
					if (hasUpgrade("t", 32) && player.i.buyables[12].gte(4)) rate = new Decimal(2/3);
					if (player.ma.current=="hs") rate = rate.times(4)
					return rate;
				},
				cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                    x = x.times(tmp[this.layer].buyables[this.id].scaleRate);
					let y = x;
					if (y.gte(10)) y = y.pow(5).div(1e4);
					let cost = {hs: Decimal.pow(10, y.pow(0.9)).floor(), ba: Decimal.pow(10, x.max(x.div(1.5).pow(2)).times(40).add(360))}
					return cost;
                },
				display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
					let primeX = "x"+(data.scaleRate.eq(1)?"":("*"+format(data.scaleRate)))
                    let display = ("价格: " + formatWhole(data.cost.hs) + " 超空间能量"+(tmp.nerdMode?" (公式: (10^("+(player[this.layer].buyables[this.id].gte(10)?"(("+primeX+"^5)/1e4)":primeX)+"^0.9)))":"")+"\n价格: "+formatWhole(data.cost.ba)+" 平衡"+(tmp.nerdMode?" (公式): (10^(((x*"+format(data.scaleRate.div(1.5))+")^2)*40+360)))":"")+"\n\
					数量: " + formatWhole(tmp.hs.hyperspace)+" / "+formatWhole(player[this.layer].buyables[this.id]))
					return display;
                },
                unlocked() { return player[this.layer].unlocked }, 
                canAfford() {
					let cost = tmp[this.layer].buyables[this.id].cost
                    return player.hs.unlocked && player.hs.points.gte(cost.hs) && player.ba.points.gte(cost.ba)
				},
                buy() { 
                    cost = tmp[this.layer].buyables[this.id].cost
					player.hs.points = player.hs.points.sub(cost.hs);
					player.ba.points = player.ba.points.sub(cost.ba);
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                },
                buyMax() {
					let y = player.hs.points.max(1).log10().root(.9);
					if (y.gte(10)) y = y.times(1e4).root(5);
					let target = y.min(player.ba.points.max(1).log10().sub(360).div(40).sqrt().times(1.5)).div(tmp[this.layer].buyables[this.id].scaleRate).plus(1).floor();
					player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].max(target);
				},
                style() { return {'height':'200px', 'width':'200px'}},
				autoed() { return hasMilestone("ma", 5) && player.hs.auto && player.ma.current!="hs" },
			},
			21: {
				title: "第一超建筑",
				cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                   return new Decimal(1);
                },
				display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    let display = ("价格: 1 超空间\n\
					数量: " + formatWhole(player[this.layer].buyables[this.id])+" / "+formatWhole(player.hs.buildLim)+"\n\n\
					第一建筑效果: ^"+format(tmp[this.layer].buyables[this.id].effect)+(tmp.nerdMode?" (公式: level*5e3+1)":""))
					return display;
                },
                unlocked() { return player[this.layer].unlocked }, 
                canAfford() {
					return player.hs.unlocked && player[this.layer].buyables[this.id].lt(player.hs.buildLim) && layers.hs.hyperspace().gte(1);
				},
				effect() {
					return softcap("hsBuilds", player[this.layer].buyables[this.id]).times(tmp.hs.buildingPower).times(5e3).plus(1);
				},
                buy() { 
					player.hs.spentHS = player.hs.spentHS.plus(1);
					player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].plus(1).min(player.hs.buildLim);
                },
                buyMax() {
					// later :)
				},
                style() { return {'height':'100px'}},
				autoed() { return false },
			},
			22: {
				title: "第二超建筑",
				cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                   return new Decimal(1);
                },
				display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    let display = ("价格: 1 超空间\n\
					数量: " + formatWhole(player[this.layer].buyables[this.id])+" / "+formatWhole(player.hs.buildLim)+"\n\n\
					第二建筑效果: ^"+format(tmp[this.layer].buyables[this.id].effect)+(tmp.nerdMode?" (公式: level*40+1)":""))
					return display;
                },
                unlocked() { return player[this.layer].unlocked }, 
                canAfford() {
					return player.hs.unlocked && player[this.layer].buyables[this.id].lt(player.hs.buildLim) && layers.hs.hyperspace().gte(1);
				},
				effect() {
					return softcap("hsBuilds", player[this.layer].buyables[this.id]).times(tmp.hs.buildingPower).times(40).plus(1);
				},
                buy() { 
					player.hs.spentHS = player.hs.spentHS.plus(1);
					player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].plus(1).min(player.hs.buildLim);
                },
                buyMax() {
					// later :)
				},
                style() { return {'height':'100px'}},
				autoed() { return false },
			},
			23: {
				title: "第三超建筑",
				cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                   return new Decimal(1);
                },
				display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    let display = ("价格: 1 超空间\n\
					数量: " + formatWhole(player[this.layer].buyables[this.id])+" / "+formatWhole(player.hs.buildLim)+"\n\n\
					第三建筑效果: ^"+format(tmp[this.layer].buyables[this.id].effect)+(tmp.nerdMode?" (公式: (level^0.8)*800+1)":""))
					return display;
                },
                unlocked() { return player[this.layer].unlocked }, 
                canAfford() {
					return player.hs.unlocked && player[this.layer].buyables[this.id].lt(player.hs.buildLim) && layers.hs.hyperspace().gte(1);
				},
				effect() {
					return softcap("hsBuilds", player[this.layer].buyables[this.id]).times(tmp.hs.buildingPower).pow(0.8).times(800).plus(1);
				},
                buy() { 
					player.hs.spentHS = player.hs.spentHS.plus(1);
					player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].plus(1).min(player.hs.buildLim);
                },
                buyMax() {
					// later :)
				},
                style() { return {'height':'100px'}},
				autoed() { return false },
			},
			24: {
				title: "第四超建筑",
				cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                   return new Decimal(1);
                },
				display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    let display = ("价格: 1 超空间\n\
					数量: " + formatWhole(player[this.layer].buyables[this.id])+" / "+formatWhole(player.hs.buildLim)+"\n\n\
					第四建筑效果: x"+format(tmp[this.layer].buyables[this.id].effect)+(tmp.nerdMode?" (公式: (level^0.8)*5e3+1)":" (不受软上限影响)"))
					return display;
                },
                unlocked() { return player[this.layer].unlocked }, 
                canAfford() {
					return player.hs.unlocked && player[this.layer].buyables[this.id].lt(player.hs.buildLim) && layers.hs.hyperspace().gte(1);
				},
				effect() {
					return softcap("hsBuilds", player[this.layer].buyables[this.id]).times(tmp.hs.buildingPower).pow(0.8).times(5e3).plus(1);
				},
                buy() { 
					player.hs.spentHS = player.hs.spentHS.plus(1);
					player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].plus(1).min(player.hs.buildLim);
                },
                buyMax() {
					// later :)
				},
                style() { return {'height':'100px'}},
				autoed() { return false },
			},
			25: {
				title: "第五超建筑",
				cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                   return new Decimal(1);
                },
				display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    let display = ("价格: 1 超空间\n\
					数量: " + formatWhole(player[this.layer].buyables[this.id])+" / "+formatWhole(player.hs.buildLim)+"\n\n\
					第五建筑效果: x"+format(tmp[this.layer].buyables[this.id].effect)+(tmp.nerdMode?" (公式: (level^0.75)*0.25+1)":""))
					return display;
                },
                unlocked() { return player[this.layer].unlocked }, 
                canAfford() {
					return player.hs.unlocked && player[this.layer].buyables[this.id].lt(player.hs.buildLim) && layers.hs.hyperspace().gte(1);
				},
				effect() {
					return softcap("hsBuilds", player[this.layer].buyables[this.id]).times(tmp.hs.buildingPower).pow(0.75).times(0.25).plus(1);
				},
                buy() { 
					player.hs.spentHS = player.hs.spentHS.plus(1);
					player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].plus(1).min(player.hs.buildLim);
                },
                buyMax() {
					// later :)
				},
                style() { return {'height':'100px'}},
				autoed() { return false },
			},
			26: {
				title: "第六超建筑",
				cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                   return new Decimal(1);
                },
				display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    let display = ("价格: 1 超空间\n\
					数量: " + formatWhole(player[this.layer].buyables[this.id])+" / "+formatWhole(player.hs.buildLim)+"\n\n\
					第六建筑效果: ^"+format(tmp[this.layer].buyables[this.id].effect)+(tmp.nerdMode?" (公式: (level^1.1)/1.2+1)":""))
					return display;
                },
                unlocked() { return player[this.layer].unlocked && player.i.buyables[11].gte(1) }, 
                canAfford() {
					return player.hs.unlocked && player[this.layer].buyables[this.id].lt(player.hs.buildLim) && layers.hs.hyperspace().gte(1);
				},
				effect() {
					return softcap("hsBuilds", player[this.layer].buyables[this.id]).times(tmp.hs.buildingPower).pow(1.1).div(1.2).plus(1);
				},
                buy() { 
					player.hs.spentHS = player.hs.spentHS.plus(1);
					player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].plus(1).min(player.hs.buildLim);
                },
                buyMax() {
					// later :)
				},
                style() { return {'height':'100px'}},
				autoed() { return false },
			},
			27: {
				title: "第七超建筑",
				cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                   return new Decimal(1);
                },
				display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    let display = ("价格: 1 超空间\n\
					数量: " + formatWhole(player[this.layer].buyables[this.id])+" / "+formatWhole(player.hs.buildLim)+"\n\n\
					第七建筑效果: ^"+format(tmp[this.layer].buyables[this.id].effect)+(tmp.nerdMode?" (公式: level/5+1)":""))
					return display;
                },
                unlocked() { return player[this.layer].unlocked && player.i.buyables[11].gte(2) }, 
                canAfford() {
					return player.hs.unlocked && player[this.layer].buyables[this.id].lt(player.hs.buildLim) && layers.hs.hyperspace().gte(1);
				},
				effect() {
					return softcap("hsBuilds", player[this.layer].buyables[this.id]).times(tmp.hs.buildingPower).div(5).plus(1);
				},
                buy() { 
					player.hs.spentHS = player.hs.spentHS.plus(1);
					player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].plus(1).min(player.hs.buildLim);
                },
                buyMax() {
					// later :)
				},
                style() { return {'height':'100px'}},
				autoed() { return false },
			},
			28: {
				title: "第八超建筑",
				cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                   return new Decimal(1);
                },
				display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    let display = ("价格: 1 超空间\n\
					数量: " + formatWhole(player[this.layer].buyables[this.id])+" / "+formatWhole(player.hs.buildLim)+"\n\n\
					第八建筑效果: x"+format(tmp[this.layer].buyables[this.id].effect)+(tmp.nerdMode?" (公式: level/1.15+1)":""))
					return display;
                },
                unlocked() { return player[this.layer].unlocked && player.i.buyables[11].gte(3) }, 
                canAfford() {
					return player.hs.unlocked && player[this.layer].buyables[this.id].lt(player.hs.buildLim) && layers.hs.hyperspace().gte(1);
				},
				effect() {
					return softcap("hsBuilds", player[this.layer].buyables[this.id]).times(tmp.hs.buildingPower).div(1.15).plus(1);
				},
                buy() { 
					player.hs.spentHS = player.hs.spentHS.plus(1);
					player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].plus(1).min(player.hs.buildLim);
                },
                buyMax() {
					// later :)
				},
                style() { return {'height':'100px'}},
				autoed() { return false },
			},
			29: {
				title: "第九超建筑",
				cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                   return new Decimal(1);
                },
				display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    let display = ("价格: 1 超空间\n\
					数量: " + formatWhole(player[this.layer].buyables[this.id])+" / "+formatWhole(player.hs.buildLim)+"\n\n\
					第九建筑效果: ^"+format(tmp[this.layer].buyables[this.id].effect)+(tmp.nerdMode?" (公式): level/5+1)":""))
					return display;
                },
                unlocked() { return player[this.layer].unlocked && player.i.buyables[11].gte(4) && player.ma.current!="hs" }, 
                canAfford() {
					return player.hs.unlocked && player[this.layer].buyables[this.id].lt(player.hs.buildLim) && layers.hs.hyperspace().gte(1);
				},
				effect() {
					return softcap("hsBuilds", player[this.layer].buyables[this.id]).times(tmp.hs.buildingPower).div(5).plus(1);
				},
                buy() { 
					player.hs.spentHS = player.hs.spentHS.plus(1);
					player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].plus(1).min(player.hs.buildLim);
                },
                buyMax() {
					// later :)
				},
                style() { return {'height':'100px'}},
				autoed() { return false },
			},
			30: {
				title: "第十超建筑",
				cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                   return new Decimal(1);
                },
				display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    let display = ("价格: 1 超空间\n\
					数量: " + formatWhole(player[this.layer].buyables[this.id])+" / "+formatWhole(player.hs.buildLim)+"\n\n\
					第十建筑效果: x"+format(tmp[this.layer].buyables[this.id].effect)+(tmp.nerdMode?" (公式: sqrt(level)/1.5+1)":""))
					return display;
                },
                unlocked() { return player[this.layer].unlocked && player.i.buyables[11].gte(5) }, 
                canAfford() {
					return player.hs.unlocked && player[this.layer].buyables[this.id].lt(player.hs.buildLim) && layers.hs.hyperspace().gte(1);
				},
				effect() {
					return softcap("hsBuilds", player[this.layer].buyables[this.id]).times(tmp.hs.buildingPower).sqrt().div(1.5).plus(1);
				},
                buy() { 
					player.hs.spentHS = player.hs.spentHS.plus(1);
					player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].plus(1).min(player.hs.buildLim);
                },
                buyMax() {
					// later :)
				},
                style() { return {'height':'100px'}},
				autoed() { return false },
			},
		},
})
/*
        
        
  iiii  
 i::::i 
  iiii  
        
iiiiiii 
i:::::i 
 i::::i 
 i::::i 
 i::::i 
 i::::i 
 i::::i 
 i::::i 
i::::::i
i::::::i
i::::::i
iiiiiiii
        
        
        
        
        
        
        
*/
addLayer("i", {
		name: "imperium", // This is optional, only used in a few places, If absent it just uses the layer id.
        symbol: "I", // This appears on the layer's node. Default is the id with the first letter capitalized
        position: 4, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
        startData() { return {
            unlocked: false,
			points: new Decimal(0),
			best: new Decimal(0),
			nb: new Decimal(0),
			hb: new Decimal(0),
			auto: false,
			first: 0,
        }},
        color: "#e5dab7",
        requires() { return new Decimal("1e11750") }, // Can be a function that takes requirement increases into account
        resource: "砖石", // Name of prestige currency
        baseResource: "子空间", // Name of resource prestige is based on
        baseAmount() {return player.ss.subspace}, // Get the current amount of baseResource
        type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
        exponent: new Decimal(1.8), // Prestige currency exponent
		base() { return new Decimal(((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false)?"1e100":"1e250") },
        gainMult() { // Calculate the multiplier for main currency from bonuses
            mult = new Decimal(1)
            return mult
        },
        gainExp() { // Calculate the exponent on main currency from bonuses
            return new Decimal(1)
        },
		canBuyMax() { return hasMilestone("ma", 1) },
        row: 5, // Row the layer is in on the tree (0 is the first row)
        hotkeys: [
            {key: "i", description: "按 I 进行帝国重置。", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
        ],
		resetsNothing() { return hasMilestone("ma", 1) },
        doReset(resettingLayer){ 
			let keep = [];
			let i2 = player.i.buyables[12];
			if (hasMilestone("ma", 2)) keep.push("buyables")
            if (layers[resettingLayer].row > this.row) layerDataReset(this.layer, keep)
			player.i.buyables[12] = i2;
        },
		autoPrestige() { return player.i.auto && hasMilestone("ma", 4) && player.ma.current!="i" },
        layerShown(){return player.hn.unlocked},
        branches: ["ss"],
		update(diff) {
			if (!player.i.unlocked) return;
			player.i.nb = player.i.nb.max(tmp.i.nbAmt);
			player.i.hb = player.i.hb.max(tmp.i.hbAmt);
		},
		nbAmt() {
			let amt = player.n.points.div(2e3).plus(1).log10().root(1.25)
			return amt.floor();
		},
		nextNB() {
			let next = Decimal.pow(10, player.i.nb.plus(1).pow(1.25)).sub(1).times(2e3);
			return next;
		},
		hbAmt() {
			let amt = player.hs.points.div(1e6).plus(1).log10().root(1.35)
			return amt.floor();
		},
		nextHB() {
			let next = Decimal.pow(10, player.i.hb.plus(1).pow(1.35)).sub(1).times(1e6);
			return next;
		},
		tabFormat: ["main-display",
			"prestige-button",
			"resource-display",
			["display-text", function() { return player.i.unlocked?("你有 "+formatWhole(player.i.nb)+" 星云砖 "+(tmp.nerdMode?"(公式: log(N/2e3+1)^0.8)":("(下一个在 "+format(tmp.i.nextNB)+" 星云)"))):"" }],
			["display-text", function() { return player.i.unlocked?("你有 "+formatWhole(player.i.hb)+" 超空间砖 "+(tmp.nerdMode?"(公式: log(HS/1e6+1)^0.74)":("(下一个在 "+format(tmp.i.nextHB)+" 超空间能量)"))):"" }],
			"blank",
			["display-text", function() { return (player.ma.current=="i"&&player.i.unlocked)?"注意: 在镀金砖石的时候，帝国建筑会使对方更贵！":"" }],
			"blank",
			"buyables",
		],
		buyables: {
			rows: 1,
			cols: 4,
			11: {
				title: "帝国建筑 I",
				cap() { return new Decimal(5) },
				cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                    let cost = { ib: x.times(1.4).pow(1.2).plus(1).pow(player.ma.current=="i"?player.i.buyables[12].div(4).plus(1):1).floor(), nb: x.pow(1.4).times(2).plus(4).pow(player.ma.current=="i"?player.i.buyables[12].div(6).plus(1):1).floor() }
					return cost;
                },
				formulas: {
					ib: "(x*1.4)^1.2+1",
					nb: "(x^1.4)*2+4",
					hb: "N/A",
				},
				display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id];
					let cost = data.cost;
                    let display = ((player[this.layer].buyables[this.id].gte(data.cap)?"已满":((cost.ib?("价格: "+formatWhole(cost.ib)+" 砖石"+(tmp.nerdMode?(" (公式: "+data.formulas.ib+")"):"")+"\n"):"") + (cost.nb?("价格: "+formatWhole(cost.nb)+" 星云砖"+(tmp.nerdMode?(" (公式: "+data.formulas.nb+")"):"")+"\n"):"") + (cost.hb?("价格: "+formatWhole(cost.hb)+" 超空间砖"+(tmp.nerdMode?(" (公式: "+data.formulas.hb+")"):"")+"\n"):"")))+"\n\
                    数量: " + formatWhole(player[this.layer].buyables[this.id])+" / "+formatWhole(data.cap)+"\n\
					解锁 "+formatWhole(player[this.layer].buyables[this.id])+" 新建筑 （不受额外建筑影响）")
					return display;
                },
                unlocked() { return unl(this.layer) }, 
                canAfford() {
					let cost = tmp[this.layer].buyables[this.id].cost
                    return player.i.unlocked && (cost.ib?player.i.points.gte(cost.ib):true) && (cost.nb?player.i.nb.gte(cost.nb):true) && (cost.hb?player.i.hb.gte(cost.hb):true) && player[this.layer].buyables[this.id].lt(tmp[this.layer].buyables[this.id].cap)},
                buy() { 
                    cost = tmp[this.layer].buyables[this.id].cost
					if (cost.ib) player.i.points = player.i.points.sub(cost.ib);
					if (cost.nb) player.i.nb = player.i.nb.sub(cost.nb);
					if (cost.hb) player.i.hb = player.i.hb.sub(cost.hb);
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                },
                buyMax() {
					// later :)
				},
                style: {'height':'200px', 'width':'200px'},
				autoed() { return false },
			},
			12: {
				title: "帝国建筑 II",
				cap() { return new Decimal(6) },
				cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                    let cost = { ib: x.pow(1.2).plus(1).pow(player.ma.current=="i"?player.i.buyables[11].div(2).plus(1):1).floor(), hb: x.pow(1.6).plus(5).pow(player.ma.current=="i"?player.i.buyables[11].div(5).plus(1):1).floor() }
					return cost;
                },
				formulas: {
					ib: "x^1.2+1",
					nb: "N/A",
					hb: "x^1.6+5",
				},
				displayData() {
					let amt = player[this.layer].buyables[this.id];
					let disp = ""
					if (amt.gte(1)) disp += "3 个增幅器升级\n";
					if (amt.gte(2)) disp += "5 个生成器升级\n";
					if (amt.gte(3)) disp += "5 个增强升级\n";
					if (amt.gte(4)) disp += "6 个时间升级\n";
					if (amt.gte(5)) disp += "5 个空间升级\n";
					if (amt.gte(6)) disp += "4 个诡异升级\n";
					if (disp=="") disp = "啥都没"
					return disp;
				},
				display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id];
					let cost = data.cost;
					let amt = player[this.layer].buyables[this.id];
                    let display = ((amt.gte(data.cap)?"已满":((cost.ib?("价格: "+formatWhole(cost.ib)+" 砖石"+(tmp.nerdMode?(" (公式: "+data.formulas.ib+")"):"")+"\n"):"") + (cost.nb?("价格: "+formatWhole(cost.nb)+" 星云砖"+(tmp.nerdMode?(" (公式: "+data.formulas.nb+")"):"")+"\n"):"") + (cost.hb?("价格: "+formatWhole(cost.hb)+" 超空间砖"+(tmp.nerdMode?(" (公式: "+data.formulas.hb+")"):"")+"\n"):"")))+"\n\
                    数量: " + formatWhole(amt)+" / "+formatWhole(data.cap)+"\n\
					解锁: \n"
					+data.displayData)
					return display;
                },
                unlocked() { return unl(this.layer) }, 
                canAfford() {
					let cost = tmp[this.layer].buyables[this.id].cost
                    return player.i.unlocked && (cost.ib?player.i.points.gte(cost.ib):true) && (cost.nb?player.i.nb.gte(cost.nb):true) && (cost.hb?player.i.hb.gte(cost.hb):true) && player[this.layer].buyables[this.id].lt(tmp[this.layer].buyables[this.id].cap)},
                buy() { 
                    cost = tmp[this.layer].buyables[this.id].cost
					if (cost.ib) player.i.points = player.i.points.sub(cost.ib);
					if (cost.nb) player.i.nb = player.i.nb.sub(cost.nb);
					if (cost.hb) player.i.hb = player.i.hb.sub(cost.hb);
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                },
                buyMax() {
					// later :)
				},
                style: {'height':'200px', 'width':'200px'},
				autoed() { return false },
			},
			13: {
				title: "帝国建筑 III",
				cap() { return new Decimal(3) },
				cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                    let cost = { nb: x.pow(.6).times(15).plus(380).floor(), hb: x.pow(.825).times(9e4).plus(8.2e5).floor() }
					return cost;
                },
				formulas: {
					ib: "N/A",
					nb: "(x^0.6)*15+380",
					hb: "(x^0.8)*90,000+820,000",
				},
				displayData() {
					let amt = player[this.layer].buyables[this.id];
					let disp = formatWhole(amt)+" 个新魔法"
					return disp;
				},
				display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id];
					let cost = data.cost;
					let amt = player[this.layer].buyables[this.id];
                    let display = ((amt.gte(data.cap)?"已满":((cost.ib?("价格: "+formatWhole(cost.ib)+" 砖石"+(tmp.nerdMode?(" (公式: "+data.formulas.ib+")"):"")+"\n"):"") + (cost.nb?("价格: "+formatWhole(cost.nb)+" 星云砖"+(tmp.nerdMode?(" (公式: "+data.formulas.nb+")"):"")+"\n"):"") + (cost.hb?("价格: "+formatWhole(cost.hb)+" 超空间砖"+(tmp.nerdMode?(" (公式: "+data.formulas.hb+")"):"")+"\n"):"")))+"\n\
                    数量: " + formatWhole(amt)+" / "+formatWhole(data.cap)+"\n\
					解锁: "
					+data.displayData)
					return display;
                },
                unlocked() { return unl(this.layer) && ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false) }, 
                canAfford() {
					let cost = tmp[this.layer].buyables[this.id].cost
                    return player.i.unlocked && ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false) && (cost.ib?player.i.points.gte(cost.ib):true) && (cost.nb?player.i.nb.gte(cost.nb):true) && (cost.hb?player.i.hb.gte(cost.hb):true) && player[this.layer].buyables[this.id].lt(tmp[this.layer].buyables[this.id].cap)},
                buy() { 
                    cost = tmp[this.layer].buyables[this.id].cost
					if (cost.ib) player.i.points = player.i.points.sub(cost.ib);
					if (cost.nb) player.i.nb = player.i.nb.sub(cost.nb);
					if (cost.hb) player.i.hb = player.i.hb.sub(cost.hb);
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                },
                buyMax() {
					// later :)
				},
                style: {'height':'200px', 'width':'200px'},
				autoed() { return false },
			},
			14: {
				title: "帝国建筑 IV",
				cap() { return new Decimal(2) },
				cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                    let cost = { ib: x.pow(2).plus(44), nb: x.pow(1.3).times(6).plus(390).floor(), hb: x.pow(2.25).times(9e4).plus(8.75e5).floor() }
					return cost;
                },
				formulas: {
					ib: "x^2+44",
					nb: "(x^1.3)*6+390",
					hb: "(x^2.25)*90,000+875,000",
				},
				displayData() {
					let amt = player[this.layer].buyables[this.id];
					let disp = formatWhole(amt)+" 新幽魂增幅器"
					return disp;
				},
				display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id];
					let cost = data.cost;
					let amt = player[this.layer].buyables[this.id];
                    let display = ((amt.gte(data.cap)?"已满":((cost.ib?("价格: "+formatWhole(cost.ib)+" 砖石"+(tmp.nerdMode?(" (公式: "+data.formulas.ib+")"):"")+"\n"):"") + (cost.nb?("价格: "+formatWhole(cost.nb)+" 星云砖"+(tmp.nerdMode?(" (公式: "+data.formulas.nb+")"):"")+"\n"):"") + (cost.hb?("价格: "+formatWhole(cost.hb)+" 超空间砖"+(tmp.nerdMode?(" (公式: "+data.formulas.hb+")"):"")+"\n"):"")))+"\n\
                    数量: " + formatWhole(amt)+" / "+formatWhole(data.cap)+"\n\
					解锁: "
					+data.displayData)
					return display;
                },
                unlocked() { return unl(this.layer) && ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false) }, 
                canAfford() {
					let cost = tmp[this.layer].buyables[this.id].cost
                    return player.i.unlocked && ((Array.isArray(tmp.ma.mastered))?tmp.ma.mastered.includes(this.layer):false) && (cost.ib?player.i.points.gte(cost.ib):true) && (cost.nb?player.i.nb.gte(cost.nb):true) && (cost.hb?player.i.hb.gte(cost.hb):true) && player[this.layer].buyables[this.id].lt(tmp[this.layer].buyables[this.id].cap)},
                buy() { 
                    cost = tmp[this.layer].buyables[this.id].cost
					if (cost.ib) player.i.points = player.i.points.sub(cost.ib);
					if (cost.nb) player.i.nb = player.i.nb.sub(cost.nb);
					if (cost.hb) player.i.hb = player.i.hb.sub(cost.hb);
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                },
                buyMax() {
					// later :)
				},
                style: {'height':'200px', 'width':'200px'},
				autoed() { return false },
			},
		},
})
/*
                                          
                                          
                                          
                                          
                                          
                                          
   mmmmmmm    mmmmmmm     aaaaaaaaaaaaa   
 mm:::::::m  m:::::::mm   a::::::::::::a  
m::::::::::mm::::::::::m  aaaaaaaaa:::::a 
m::::::::::::::::::::::m           a::::a 
m:::::mmm::::::mmm:::::m    aaaaaaa:::::a 
m::::m   m::::m   m::::m  aa::::::::::::a 
m::::m   m::::m   m::::m a::::aaaa::::::a 
m::::m   m::::m   m::::ma::::a    a:::::a 
m::::m   m::::m   m::::ma::::a    a:::::a 
m::::m   m::::m   m::::ma:::::aaaa::::::a 
m::::m   m::::m   m::::m a::::::::::aa:::a
mmmmmm   mmmmmm   mmmmmm  aaaaaaaaaa  aaaa
                                          
                                          
                                          
                                          
                                          
                                          
                                          
*/
addLayer("ma", {
		name: "mastery", // This is optional, only used in a few places, If absent it just uses the layer id.
        symbol: "MA", // This appears on the layer's node. Default is the id with the first letter capitalized
        position: 2, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
        startData() { return {
            unlocked: false,
			points: new Decimal(0),
			best: new Decimal(0),
			first: 0,
			mastered: [],
			selectionActive: false,
			current: null,
        }},
        color: "#ff9f7f",
        requires() { return new Decimal(100) }, // Can be a function that takes requirement increases into account
        resource: "专精", // Name of prestige currency
        baseResource: "幽魂", // Name of resource prestige is based on
        baseAmount() {return player.ps.points}, // Get the current amount of baseResource
		roundUpCost: true,
        type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
        exponent: new Decimal(1.1), // Prestige currency exponent
		base: new Decimal(1.05),
		effectBase() {
			return new Decimal(1e20);
		},
		effect() {
			return Decimal.pow(tmp.ma.effectBase, player.ma.points);
		},
		effectDescription() {
			return "增幅荣耀和超空间能量获取 "+format(tmp.ma.effect)+(tmp.nerdMode?("x (每个 "+format(tmp.ma.effectBase)+"x)"):"x")+"，并使超建筑增益 +"+format(tmp.ma.effect.max(1).log10().times(2.5))+"%"+(tmp.nerdMode?(" (每个 +"+format(tmp.ma.effectBase.max(1).log10().times(2.5))+"%)"):"")
		},
        gainMult() { // Calculate the multiplier for main currency from bonuses
            mult = new Decimal(1)
			if (hasAchievement("a", 131)) mult = mult.div(1.1);
			if (hasAchievement("a", 95)) mult = mult.div(1.15);
			if (hasAchievement("a", 134)) mult = mult.times(Decimal.pow(.999925, player.ps.points));
			if (hasAchievement("a", 163)) mult = mult.div(Decimal.pow(1.1, player.a.achievements.filter(x => x>160).length));
            return mult
        },
        gainExp() { // Calculate the exponent on main currency from bonuses
            return new Decimal(1)
        },
		canBuyMax() { return false },
        row: 6, // Row the layer is in on the tree (0 is the first row)
        hotkeys: [
            {key: "A", description: "按 Shift+A 进行专精重置。", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
        ],
		resetsNothing() { return false },
        doReset(resettingLayer){ 
			let keep = [];
            if (layers[resettingLayer].row > this.row) layerDataReset(this.layer, keep)
        },
		autoPrestige() { return false },
        layerShown(){return player.ps.unlocked && player.i.unlocked},
        branches: ["hn", "hs", ["ps", 2]],
		tabFormat: {
			Mastery: {
				content: ["main-display",
					"prestige-button",
					"resource-display",
					"blank", "milestones",
					"blank", "blank",
					"clickables",
				],
			}, 
			"Mastery Rewards": {
				buttonStyle() { return {'background-color': '#ff9f7f', 'color': 'black'} },
				content: ["blank", "blank", "blank", ["raw-html", function() { return tmp.ma.rewardDesc }]],
			},
		},
		rewardDesc() {
			let desc = "";
			if (player.ma.mastered.includes("p")) desc += "<h2>声望</h2><br><br><ul><li>基础声望获取指数提高 (0.5 -> 0.75)</li><li><b>声望增益</b> 提高 ^1.1 (软上限之后)</li><li><b>自协同</b> 提高 ^75</li><li><b>更多声望</b> 提高 (+80% -> +1e52%)</li><li><b>力量升级</b> 提高 ^40</li><li><b>翻转声望增益</b> 提高 ^1.5</li></ul><br><br>";
			if (player.ma.mastered.includes("b")) desc += "<h2>增幅器</h2><br><br><ul><li>降低增幅器价格底数 (5 -> 1.5)</li><li>降低增幅器价格指数 (1.25 -> 0.75)</li><li><b>BP 连击</b> & <b>一折</b> 提高 ^1.5</li><li><b>交叉污染</b> & <b>PB 反转</b> 增幅超级增幅器底数</li><li><b>差的 BP 连击</b> 提高 ^20,000</li><li><b>更更多添加物</b> 提高至立方</li></ul><br><br>";
			if (player.ma.mastered.includes("g")) desc += "<h2>生成器</h2><br><br><ul><li>生成器价格底数降低 (5 -> 2.5)</li><li>生成器价格指数降低 (1.25 -> 1.1)</li><li>GP 效果提高 ^1.05</li><li><b>GP 连击</b> 提高 ^500,000</li><li><b>给我更多 III</b> 提高 ^10,000</li></ul><br><br>";
			if (player.ma.mastered.includes("t")) desc += "<h2>时间</h2><br><br><ul><li>时间价格底数降低 (1e15 -> 10)</li><li>时间价格指数降低 (1.85 -> 1.4)</li><li>时间胶囊获得新效果</li><li>任何加成 TE 上限底数的效果增益增幅器和生成器底数（乘）</li><li>TE 第一效果软上限延迟 (e3.1e9)</li><li>扩展时空胶囊价格降低至 ^0.9</li><li><b>伪增益</b> & <b>底数</b> 加成 TE 获取（乘），且效果提升至立方</li><li><b>增强时间</b> 提升至 1.1 次幂</li></ul><br><br>";
			if (player.ma.mastered.includes("e")) desc += "<h2>增强</h2><br><br><ul><li>增强获取指数提高 (0.02 -> 0.025)</li><li>增强子第二效果提升至 100 次方</li><li><b>增强声望</b> 影响点数获取，且效果提高 ^1.5</li><li><b>进入 E-空间</b> 加强 250%</li><li><b>野兽般增长</b> 底数提高 (1.1 -> 1e2,000)</li><li><b>进阶</b> 提高至立方</li></ul><br><br>";
			if (player.ma.mastered.includes("s")) desc += "<h2>空间</h2><br><br><ul><li>空间价格底数降低 (1e10 -> 10)</li><li>空间价格指数降低 (1.85 -> 1.4)</li><li>建筑增益除以 3.85，但建筑价格缩放被 5 倍减缓</li></ul><br><br>";
			if (player.ma.mastered.includes("sb")) desc += "<h2>超级增幅器</h2><br><br><ul><li>超级增幅器价格底数降低 (1.05 -> 1.025)</li><li>超级增幅器价格指数降低 (1.25 -> 1.075)</li><li>超级增幅器价格除以 1.333</li><li>超级增幅器提供虚增幅器</li></ul><br><br>";
			if (player.ma.mastered.includes("sg")) desc += "<h2>超级生成器</h2><br><br><ul><li>超级生成器价格底数降低 (1.05 -> 1.04)</li><li>超级生成器价格指数降低 (1.25 -> 1.225)</li><li>超级生成器价格除以 1.1</li><li>超级 GP 效果平方</li><li>超级生成器随时间提供虚生成器</li></ul><br><br>";
			if (player.ma.mastered.includes("q")) desc += "<h2>诡异</h2><br><br><ul><li>诡异获取指数提高 (7.5e-3 -> 8e-3)</li><li>QE 效果软上限开始提高 ^1.5</li><li>诡异层价格底数降低至 ^0.75</li><li><b>千种能力</b> 提高 50%</li><li>第十建筑等级提供免费的诡异改良（等于其等级除以 4）</li></ul><br><br>";
			if (player.ma.mastered.includes("h")) desc += "<h2>障碍</h2><br><br><ul><li>障碍灵魂获取指数提高 (0.125 -> 0.2)</li><li>障碍灵魂软上限效果变弱 (指数 4 次根 -> 指数 2.5 次根)</li><li>解锁一个新障碍里程碑</li><li><b>速度之魔</b> 有第二效果</li><li><b>空间紧缺</b> 提高 40%</li><li><b>永恒</b> & <b>D 选项</b> 不再有完成次数限制</li><li><b>永恒</b> 效果提升 ^5</li><li><b>减产</b>对诡异层价格底数的削弱更强 (0.15 -> 0.2)</li></ul><br><br>";
			if (player.ma.mastered.includes("o")) desc += "<h2>阳光</h2><br><br><ul><li>每个超级增幅器为阳光获取指数提高 0.5%（叠加）</li><li>SE 获取指数限制提高到 0.15，但 0.1 之后它增长大幅度减缓</li><li>SE 第二效果提高 10%</li><li>每 OoM 阳光为太阳能 +20%</li><li>阳光可购买项获取提高 ^2.6</li><li>一行阳光可购买项的所有效果提升 ^1.1</li><li><b>对流能</b> 效果提高 ^25</li><li>第二行所有阳光可购买项的所有效果乘以 1.4</li><li>第三行阳光可购买项的效果乘以 1.9</li></ul><br><br>";
			if (player.ma.mastered.includes("ss")) desc += "<h2>子空间</h2><br><br><ul><li>子空间价格底数降低 (1.15 -> 1.1)</li><li>子空间价格指数降低 (1.1 -> 1.07)</li><li>每个子空间能量将子空间底数乘 1e10</li><li>第三建筑效果提高 ^3</li><li>当 <b>子空间觉醒</b> 效果超过 100%，其被立方但除以 10,000</li><li><b>粉碎使徒</b> 效果提升 ^400</li><li><b>止步</b> 效果翻倍</li><li><b>挑战加速</b> 的临界点大幅度提高 (e1,000,000 -> e1e11)</li></ul><br><br>";
			if (player.ma.mastered.includes("m")) desc += "<h2>魔法</h2><br><br><ul><li>魔法获取指数提高 (7e-3 -> 8.5e-3)</li><li>魔法强度 +50%</li><li>妖术效果软上限不再作用于对障碍灵魂、诡异和 SE 的获取增幅，但这个效果被开方</li><li>每 OoM 魔法延迟妖术效果软上限 1e-3%</li><li>妖术效果软上限指数提高 (10 -> 2e3)</li></ul><br><br>";
			if (player.ma.mastered.includes("ba")) desc += "<h2>平衡</h2><br><br><ul><li>平衡获取指数提高 (5e-3 -> 0.0125)</li><li>消极和积极不再有惩罚</li><li><b>净中立</b> 的两个效果指数提高 ^2.5</li><li><b>实体重生</b> 提高 ^10</li></ul><br><br>";
			if (player.ma.mastered.includes("ps")) desc += "<h2>幽魂</h2><br><br><ul><li>幽魂价格底数开方</li><li>幽魂获取公式提高 (PS^1.5 -> 1.2^PS)</li><li>恶魂效果提高 ^100</li><li>幽魂价格缩放减缓 50% </li><li>灵魂价格缩放减缓 20%</li><li>幽魂增幅器增强 10%</li></ul><br><br>";
			if (player.ma.mastered.includes("hn")) desc += "<h2>荣耀</h2><br><br><ul><li>对于平衡的荣耀获取指数提高 (0.02 -> 0.05)</li><li>第二个荣耀升级不再有软上限</li><li><b>自自协同</b> 效果乘 5</li><li><b>点数效率</b> 上限由 90% 提高至 92%%</li><li><b>超级升级</b> 效果乘 3</li><li><b>翻转强化</b> 提高 10%</li><li><b>列长长</b> 提高 10%</li><li><b>一次又一次</b> 效果翻倍</li><li><b>诅咒</b> 效果提高到 ^50</li></ul><br><br>";
			if (player.ma.mastered.includes("n")) desc += "<h2>星云</h2><br><br><ul><li>星云获取指数提高 (0.03 -> 0.05)</li><li>一级星尘效果提升 ^1.6</li><li>二级星尘效果提升 ^1.4</li><li>星尘获取提升 1e30x</li></ul><br><br>";
			if (player.ma.mastered.includes("hs")) desc += "<h2>超空间</h2><br><br><ul><li>超建筑上限需求缩放减缓 20%</li><li>每个购买的超空间提供 0.1% 超建筑增益</li><li>超建筑软上限延迟 0.1 等级开始</li></ul><br><br>";
			if (player.ma.mastered.includes("i")) desc += "<h2>砖石</h2><br><br><ul><li>帝国建筑价格底数降低 (1e250 -> 1e100)</li><li>每个星云砖将星云获取乘以 10</li><li>每个超空间砖将超空间能量获取乘以 10</li><li>解锁 2 个新的帝国建筑</li></ul><br><br>";
			return desc;
		},
		milestones: {
			0: {
				requirementDescription: "1 专精",
				done() { return player.ma.best.gte(1) },
				effectDescription: "对于所有第七行重置保留超空间和星团，解锁自动幽灵。",
				toggles: [["ps", "autoGhost"]],
			},
			1: {
				requirementDescription: "2 专精",
				done() { return player.ma.best.gte(2) },
				effectDescription: "你可以最大购买砖石（同时不重置任何东西），每秒获得 100% 的荣耀，对于任何重置保留荣耀里程碑和荣耀升级。",
			},
			2: {
				requirementDescription: "3 专精",
				done() { return player.ma.best.gte(3) },
				effectDescription: "重置时保留帝国建筑 I 和超建筑，每秒获取 100% 超空间能量。",
			},
			3: {
				requirementDescription: "4 专精",
				done() { return player.ma.best.gte(4) },
				effectDescription: "每秒获得 100% 星云。",
			},
			4: {
				requirementDescription: "5 专精",
				done() { return player.ma.best.gte(5) },
				effectDescription: "解锁自动砖石。",
				toggles: [["i", "auto"]],
			},
			5: {
				unlocked() { return hasMilestone("ma", 4) },
				requirementDescription: "16 专精",
				done() { return player.ma.best.gte(16) },
				effectDescription: "解锁自动超空间",
				toggles: [["hs", "auto"]],
			},
		},
		clickables: {
			rows: 1,
			cols: 1,
			11: {
				title: "镀金",
				cap: 19,
				display() {
					if (player.ma.current!==null) return "正在镀金: "+tmp[player.ma.current].name+"。点此结束此运行。";
					else return player.ma.selectionActive?"你在镀金模式中。点击你想要镀金的层，点此退出镀金。":("开始一次镀金。<br><br>"+((tmp.ma.amtMastered>=this.cap)?"已满":("需要: "+formatWhole(tmp[this.layer].clickables[this.id].req)+" 专精")));
				},
				unlocked() { return player.ma.unlocked },
				req() { return [2,5,7,8,9,9,10,10,11,12,14,14,15,16,18,20,21,22,23,(1e300)][tmp.ma.amtMastered||0] },
				canClick() { return player.ma.unlocked && (player.ma.selectionActive?true:(tmp.ma.amtMastered<this.cap&&player.ma.points.gte(tmp[this.layer].clickables[this.id].req))) },
				onClick() { 
					if (player.ma.current !== null) {
						if (!confirm("你确定要退出此次镀金运行吗？")) return;
						player.ma.selectionActive = false;
						player.ma.current = null;
						doReset("ma", true);
					} else player.ma.selectionActive = !player.ma.selectionActive;
				},
				style: {"height": "200px", "width": "200px"},
			},
		},
		amtMastered() {
			let amt = tmp.ma.mastered.length;
			if (player.ma.current!==null) if (player.ma.mastered.includes(player.ma.current)) amt--;
			return amt;
		},
		mastered() {
			if (player.ma.current!==null) return player.ma.mastered.concat(player.ma.current);
			return player.ma.mastered;
		},
		canBeMastered() {
			if (!player.ma.selectionActive) return [];
			if (player.ma.mastered.length==0) return ["p"];
			let rows = player.ma.mastered.map(x => tmp[x].row)
			let realRows = rows.filter(y => Object.keys(ROW_LAYERS[y]).every(z => player.ma.mastered.includes(z) || tmp.ma.masteryGoal[z]===undefined));
			let furthestRow = Math.max(...realRows)+((player.ma.current !== null)?0:1);
			let m = Object.keys(layers).filter(x => (tmp[x].row<=furthestRow&&tmp.ma.masteryGoal[x]!==undefined&&(tmp.ma.specialReqs[x]?tmp.ma.specialReqs[x].every(y => player.ma.mastered.includes(y)):true))||player.ma.mastered.includes(x));
			if (player.ma.current !== null) m.push(player.ma.current);
			
			return m;
		},
		startMastery(layer) {
			if (!confirm("你确定要开始镀金 "+tmp[layer].name+" 吗？这会进行一次第七行重置，并使你处于仅镀金层以及正在镀金层活跃的运行。")) return;
			player.ma.current = layer;
			
			if (player[layer].upgrades) player[layer].upgrades = [];
			if (player[layer].challenges) for (let n in player[layer].challenges) player[layer].challenges[n] = null;
			if (player.subtabs[layer]) player.subtabs[layer].mainTabs = "Main Tab";
			if (layer=="n") {
				resetBuyables("n");
				player.n.activeSecondaries = {purpleBlue: false, blueOrange: false, orangePurple: false};
			}
			if (layer=="hs") {
				resetBuyables("hs")
				player.hs.spentHS = new Decimal(0);
			}
			if (layer=="i") resetBuyables("i");
			
			doReset("ma", true);
		},
		completeMastery(layer) {
			let data = tmp.ma;
			if (player[layer].points.lt(data.masteryGoal[layer])) return;
			if (!player.ma.mastered.includes(layer)) player.ma.mastered.push(layer);
			player.ma.selectionActive = false;
			player.ma.current = null;
			doReset("ma", true);
		},
		specialReqs: {
			sb: ["t","e","s"],
			sg: ["t","e","s"],
			h: ["q"],
			o: ["q","h"],
			ss: ["q","h"],
			ps: ["m","ba"],
			n: ["hn"],
			hs: ["hn"],
			i: ["n","hs"],
		},
		masteryGoal: {
			p: new Decimal("1e11488"),
			b: new Decimal(2088),
			g: new Decimal(1257),
			t: new Decimal(814),
			e: new Decimal("e3469000"),
			s: new Decimal(817),
			sb: new Decimal(36),
			sg: new Decimal(20),
			q: new Decimal("e480000"),
			h: new Decimal("e416000"),
			o: new Decimal(1e34),
			ss: new Decimal(21),
			m: new Decimal("1e107350"),
			ba: new Decimal("1e207500"),
			ps: new Decimal(115),
			hn: new Decimal("1e31100"),
			n: new Decimal("1e397"),
			hs: new Decimal("1e512"),
			i: new Decimal(43),
		},
		rowLimit: 6,
})
/*
                                        
                                        
                                        
                                        
                                        
                                        
   ggggggggg   ggggg    eeeeeeeeeeee    
  g:::::::::ggg::::g  ee::::::::::::ee  
 g:::::::::::::::::g e::::::eeeee:::::ee
g::::::ggggg::::::gge::::::e     e:::::e
g:::::g     g:::::g e:::::::eeeee::::::e
g:::::g     g:::::g e:::::::::::::::::e 
g:::::g     g:::::g e::::::eeeeeeeeeee  
g::::::g    g:::::g e:::::::e           
g:::::::ggggg:::::g e::::::::e          
 g::::::::::::::::g  e::::::::eeeeeeee  
  gg::::::::::::::g   ee:::::::::::::e  
    gggggggg::::::g     eeeeeeeeeeeeee  
            g:::::g                     
gggggg      g:::::g                     
g:::::gg   gg:::::g                     
 g::::::ggg:::::::g                     
  gg:::::::::::::g                      
    ggg::::::ggg                        
       gggggg                           
*/
addLayer("ge", {
		name: "gears", // This is optional, only used in a few places, If absent it just uses the layer id.
        symbol: "GE", // This appears on the layer's node. Default is the id with the first letter capitalized
        position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
        startData() { return {
            unlocked: false,
			points: new Decimal(0),
			best: new Decimal(0),
			total: new Decimal(0),
			first: 0,
			rotations: new Decimal(0),
			energy: new Decimal(0),
			toothPower: new Decimal(0),
			shrinkPower: new Decimal(0),
			boosted: new Decimal(0),
			maxToggle: false,
			auto: false,
			autoTime: new Decimal(0),
        }},
        color: "#bfbfbf",
		nodeStyle() { return {
			background: (player.ge.unlocked||canReset("ge"))?((player.grad&&!player.oldStyle)?"radial-gradient(circle, #bfbfbf 0%, #838586 100%)":"#838586"):"#bf8f8f",
		}},
		componentStyles: {
			background() { return (player.ge.unlocked||canReset("ge"))?((player.grad&&!player.oldStyle)?"radial-gradient(circle, #bfbfbf 0%, #838586 100%)":"#bfbfbf"):"#bf8f8f" },
		},
        requires: new Decimal(1e256), // Can be a function that takes requirement increases into account
        resource: "齿轮", // Name of prestige currency 
        baseResource: "尘积", // Name of resource prestige is based on
        baseAmount() {return tmp.n.dustProduct}, // Get the current amount of baseResource
        type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
        exponent: new Decimal(0.01), // Prestige currency exponent
        gainMult() { // Calculate the multiplier for main currency from bonuses
            mult = new Decimal(1);
			if (player.mc.unlocked) mult = mult.times(clickableEffect("mc", 12));
			if (player.mc.upgrades.includes(11)) mult = mult.times(buyableEffect("mc", 12));
			if (hasMilestone("ge", 2)) mult = mult.times(player.en.total.max(1));
			if (player.r.unlocked) mult = mult.times(tmp.r.buildingEff);
			if (hasMilestone("id", 5) && tmp.id) mult = mult.times(tmp.id.rev.max(1));
			if (hasUpgrade("ai", 33)) mult = mult.times(upgradeEffect("ai", 33));
			if (hasUpgrade("ai", 44)) mult = mult.times(upgradeEffect("ai", 44));
            return mult
        },
        gainExp() { // Calculate the exponent on main currency from bonuses
            let exp = new Decimal(1)
			if (hasUpgrade("ai", 34)) exp = exp.times(1.2);
			return exp;
        },
        row: 6, // Row the layer is in on the tree (0 is the first row)
        hotkeys: [
            {key: "E", description: "按 Shift+E 进行齿轮重置", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
        ],
		passiveGeneration() { return hasMilestone("ge", 2)?0.01:0 },
        doReset(resettingLayer){ 
			let keep = [];
			if (layers[resettingLayer].row > this.row) layerDataReset(this.layer, keep)
			if (layers[resettingLayer].row >= this.row) {
				player.ge.energy = new Decimal(0);
				player.ge.toothPower = new Decimal(0);
				player.ge.shrinkPower = new Decimal(0);
				player.ge.rotations = new Decimal(0);
			}
        },
        layerShown(){return player.ma.unlocked },
        branches: ["n", "r"],
		tabFormat: ["main-display",
			"prestige-button",
			"resource-display", "blank",
			"milestones",
			"blank", "blank", 
			["display-text", function() { return "<h3>齿轮速度: "+format(tmp.ge.gearSpeed)+"x</h3>"+(tmp.nerdMode?" (cbrt(gears))":"") }],
			"blank",
			["display-text", function() { return "<b>齿轮半径: "+format(tmp.ge.radius)+"m</b>"+(tmp.nerdMode?" (teeth*toothSize/6.28)":"") }], "blank",
			["row", [["display-text", function() { return "<h3>转速: "+formatWhole(player.ge.rotations, true)+" ("+tmp.ge.rotDesc+")</h3><br>转速效果: 加成星云和星尘获取 "+format(tmp.ge.rotEff)+(tmp.nerdMode?" ((x+1)^5)":"") }]]],
			"blank", "blank",
			["clickable", 21],
			"blank", "blank",
			["row", [["column", [["raw-html", function() { return "<h3>齿: "+(hasMilestone("ge", 3)?format(tmp.ge.teeth):formatWhole(tmp.ge.teeth, true))+"</h3>" }], "blank", ["clickable", 11]], {"background-color": "#b0babf", color: "black", width: "12vw", padding: "10px", margin: "0 auto", "height": "250px"}], ["column", [["raw-html", function() { return "<h3>动能: "+format(player.ge.energy)+" J</h3><br><br>速度: "+format(tmp.ge.speed)+"m/s"+(tmp.nerdMode?" (sqrt(x))":"") }], "blank", ["clickable", 12]], {"background-color": "#dec895", color: "black", width: "12vw", padding: "10px", margin: "0 auto", "height": "250px"}], ["column", [["raw-html", function() { return "<h3>齿大小: "+format(tmp.ge.toothSize)+"m</h3><br><br>" }], "blank", ["clickable", 13]], {"background-color": "#bfa1b8", color: "black", width: "12vw", padding: "10px", margin: "0 auto", "height": "250px"}]]], "blank",
			["buyable", 11], "blank",
		],
		update(diff) {
			if (!player.ge.unlocked) return;
			let factor = tmp.ge.gearSpeed
			player.ge.energy = player.ge.energy.plus(factor.times(diff).times(tmp.ge.clickables[12].effect));
			player.ge.toothPower = player.ge.toothPower.plus(factor.times(diff));
			player.ge.shrinkPower = player.ge.shrinkPower.plus(factor.times(diff));
			player.ge.rotations = player.ge.rotations.plus(tmp.ge.rps.times(diff));
			player.ge.autoTime = player.ge.autoTime.plus(diff);
			if (player.ge.auto && hasMilestone("ge", 3) && player.ge.autoTime.gte(.5)) {
				player.ge.autoTime = new Decimal(0);
				if (layers.ge.clickables[11].canClick()) layers.ge.clickables[11].onClick();
				if (layers.ge.clickables[12].canClick()) layers.ge.clickables[12].onClick();
				if (layers.ge.clickables[13].canClick()) layers.ge.clickables[13].onClick();
			}
		},
		rotEff() {
			return softcap("rotEff", player.ge.rotations.round().plus(1).pow(5));
		},
		gearSpeed() {
			let speed = player.ge.points.cbrt().times(player.mc.unlocked?tmp.mc.mechEff:1);
			if (player.mc.upgrades.includes(11)) speed = speed.times(buyableEffect("mc", 12));
			return speed;
		},
		rps() {
			return tmp.ge.speed.div(tmp.ge.teeth.times(tmp.ge.toothSize)).times(tmp.ge.gearSpeed)
		},
		rotDesc() {
			let rps = tmp.ge.rps;
			let desc = "";
			if (rps.lt(1)) desc = format(rps.times(60))+" RPM";
			else desc = format(rps)+" RPS";
			
			if (tmp.nerdMode) desc += " </h3>((velocity*gearSpeed)/(radius*6.28))<h3>"
			return desc;
		},
		speed() {
			return player.ge.energy.sqrt();
		},
		teeth() {
			let t = player.ge.toothPower.pow(1.5).plus(100).div(tmp.ge.clickables[11].unlocked?tmp.ge.clickables[11].effect:1);
			if (hasMilestone("ge", 3)) return t.max(0);
			else return t.floor().max(1);
		},
		toothSize() {
			return player.ge.shrinkPower.plus(1).pow(-0.5).div(tmp.ge.clickables[13].effect).times(player.mc.unlocked?tmp.mc.buyables[11].effect.pow(hasAchievement("a", 125)?(-1):1):1);
		},
		radius() { return tmp.ge.teeth.times(tmp.ge.toothSize).div(2*Math.PI) },
		boostReducedPurch() { return tmp.ge.buyables[11].effect.times(4) },
		boostReq() { 
			let x = player.ge.boosted.sub(tmp.ge.boostReducedPurch);
			if (x.gte(20)) x = x.pow(2).div(20);
			return Decimal.pow(1e10, x.pow(1.2).times(x.lt(0)?(-1):1)).times(1e280) 
		},
		boostReqFormula() { return player.ge.boosted.sub(tmp.ge.boostReducedPurch).gte(20)?"1e10^(((totalBought^2)/20)^1.2) * 1e280":"1e10^(totalBought^1.2) * 1e280" },
		buyables: {
			rows: 1,
			cols: 1,
			11: {
				title: "齿轮进化",
				costDiv() {
					let div = new Decimal(1);
					if (hasAchievement("a", 124)) div = div.times(3);
					return div;
				},
				free() {
					let free = new Decimal(0);
					if (hasAchievement("a", 132)) free = free.plus(2);
					return free;
				},
				power() {
					let pow = new Decimal(1);
					if (hasAchievement("a", 124)) pow = pow.times(1.2);
					if (hasUpgrade("ai", 14)) pow = pow.times(1.111);
					return pow;
				},
				cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                    if (x.gte(15)) x = x.times(1.63);
					return Decimal.pow(125, x.pow(1.425)).times(1e3).div(tmp.ge.buyables[this.id].costDiv)
                },
				effectPer() { return Decimal.div(tmp.ge.buyables[this.id].power, 2) },
				effect() { return Decimal.mul(tmp[this.layer].buyables[this.id].effectPer, player[this.layer].buyables[this.id].plus(tmp.ge.buyables[this.id].free).times(hasUpgrade("ai", 13)?1.5:1)) },
				display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id];
					let cost = data.cost;
					let amt = player[this.layer].buyables[this.id];
                    let display = "重置所有齿轮升级，并进行一次第七行重置，对每个效果底数加成 "+format(data.effectPer)+"，并降低它们的价格 "+format(data.effectPer.times(4))+" 次购买。<br><br>需要: "+formatWhole(cost)+" 转速"+(tmp.nerdMode?" (价格公式: 125^(x^1.425)*1e3)":"")+".<br>当前: 底数+"+format(data.effect)+"，价格降低 "+format(data.effect.times(4))+" 购买";
					return display;
                },
                unlocked() { return unl(this.layer) }, 
                canAfford() {
					let cost = tmp[this.layer].buyables[this.id].cost
                    return player[this.layer].unlocked && player.ge.rotations.gte(cost);
				},
                buy() { 
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
					player.ge.boosted = new Decimal(0);
					for (let i=11;i<=13;i++) player.ge.clickables[i] = "";
					if (!hasMilestone("ge", 3)) doReset("ge", true);
                },
                buyMax() {
					// later :)
				},
                style: {'height':'200px', 'width':'200px'},
				autoed() { return false },
			},
		},
		clickables: {
			rows: 2,
			cols: 3,
			11: {
				title() { return "齿数量除以 "+format(tmp.ge.clickables[this.id].effectPer) },
				display() { 
					return "需要: "+format(tmp.ge.clickables[this.id].req)+" 尘积"+(tmp.nerdMode?" ("+tmp.ge.boostReqFormula+")":"")+"<br><br>当前: /"+format(tmp.ge.clickables[this.id].effect);
				},
				req() {
					if (hasMilestone("ge", 1)) {
						let x = new Decimal(player.ge.clickables[this.id]||0).sub(tmp.ge.boostReducedPurch);
						if (x.gte(20)) x = x.pow(2).div(20);
						return Decimal.pow(1e10, x.pow(1.2).times(x.lt(0)?(-1):1)).times(1e280) 
					} else return tmp.ge.boostReq;
				},
				effectPer() { return Decimal.add(2, tmp.ge.buyables[11].effect) },
				effect() { return Decimal.pow(tmp.ge.clickables[this.id].effectPer, player.ge.clickables[this.id]) },
				unlocked() { return player.ge.unlocked && hasAchievement("a", 133) },
				canClick() { return player.ge.unlocked && tmp.n.dustProduct.gte(tmp.ge.clickables[this.id].req) },
				onClick() { 
					if (player.ge.maxToggle && hasMilestone("ge", 0)) {
						let x = tmp.n.dustProduct.div(1e280).max(1).log(1e10).root(1.2);
						if (x.gte(20)) x = x.times(20).sqrt();
						x = x.plus(tmp.ge.boostReducedPurch).plus(1).floor();
						let totalOther;
						if (hasMilestone("ge", 1)) totalOther = 0;
						else totalOther = Object.keys(player.ge.clickables).filter(x => (x!=this.id && x<20)).map(x => player.ge.clickables[x]).reduce((a,c) => Decimal.add(a, c));
						let target = x.sub(totalOther).max(0);
						player.ge.boosted = player.ge.boosted.max(x);
						player.ge.clickables[this.id] = Decimal.max(player.ge.clickables[this.id], target);
					} else {
						player.ge.boosted = player.ge.boosted.plus(1);
						player.ge.clickables[this.id] = Decimal.add(player.ge.clickables[this.id], 1)
					}
				},
				style: {"height": "150px", "width": "150px"},
			},
			12: {
				title() { return "增幅动能 "+format(tmp.ge.clickables[this.id].effectPer)+"x" },
				display() { 
					return "需要: "+format(tmp.ge.clickables[this.id].req)+" 尘积"+(tmp.nerdMode?" ("+tmp.ge.boostReqFormula+")":"")+"<br><br>当前: "+format(tmp.ge.clickables[this.id].effect)+"x";
				},
				req() {
					if (hasMilestone("ge", 1)) {
						let x = new Decimal(player.ge.clickables[this.id]||0).sub(tmp.ge.boostReducedPurch);
						if (x.gte(20)) x = x.pow(2).div(20);
						return Decimal.pow(1e10, x.pow(1.2).times(x.lt(0)?(-1):1)).times(1e280) 
					} else return tmp.ge.boostReq;
				},
				effectPer() { return Decimal.add(6, tmp.ge.buyables[11].effect).times(hasAchievement("a", 123)?4:1) },
				effect() { return Decimal.pow(tmp.ge.clickables[this.id].effectPer, player.ge.clickables[this.id]) },
				unlocked() { return player.ge.unlocked },
				canClick() { return player.ge.unlocked && tmp.n.dustProduct.gte(tmp.ge.clickables[this.id].req) },
				onClick() { 
					if (player.ge.maxToggle && hasMilestone("ge", 0)) {
						let x = tmp.n.dustProduct.div(1e280).max(1).log(1e10).root(1.2);
						if (x.gte(20)) x = x.times(20).sqrt();
						x = x.plus(tmp.ge.boostReducedPurch).plus(1).floor();
						let totalOther;
						if (hasMilestone("ge", 1)) totalOther = 0;
						else totalOther = Object.keys(player.ge.clickables).filter(x => (x!=this.id && x<20)).map(x => player.ge.clickables[x]).reduce((a,c) => Decimal.add(a, c));
						let target = x.sub(totalOther).max(0);
						player.ge.boosted = player.ge.boosted.max(x);
						player.ge.clickables[this.id] = Decimal.max(player.ge.clickables[this.id], target);
					} else {
						player.ge.boosted = player.ge.boosted.plus(1);
						player.ge.clickables[this.id] = Decimal.add(player.ge.clickables[this.id], 1)
					}
				},
				style: {"height": "150px", "width": "150px"},
			},
			13: {
				title() { return "齿大小除以 "+format(tmp.ge.clickables[this.id].effectPer) },
				display() { 
					return "需要: "+format(tmp.ge.clickables[this.id].req)+" 尘积"+(tmp.nerdMode?" ("+tmp.ge.boostReqFormula+")":"")+"<br><br>当前: /"+format(tmp.ge.clickables[this.id].effect);
				},
				req() {
					if (hasMilestone("ge", 1)) {
						let x = new Decimal(player.ge.clickables[this.id]||0).sub(tmp.ge.boostReducedPurch);
						if (x.gte(20)) x = x.pow(2).div(20);
						return Decimal.pow(1e10, x.pow(1.2).times(x.lt(0)?(-1):1)).times(1e280) 
					} else return tmp.ge.boostReq;
				},
				effectPer() { return Decimal.add(2, tmp.ge.buyables[11].effect) },
				effect() { return Decimal.pow(tmp.ge.clickables[this.id].effectPer, player.ge.clickables[this.id]) },
				unlocked() { return player.ge.unlocked },
				canClick() { return player.ge.unlocked && tmp.n.dustProduct.gte(tmp.ge.clickables[this.id].req) },
				onClick() { 
					if (player.ge.maxToggle && hasMilestone("ge", 0)) {
						let x = tmp.n.dustProduct.div(1e280).max(1).log(1e10).root(1.2);
						if (x.gte(20)) x = x.times(20).sqrt();
						x = x.plus(tmp.ge.boostReducedPurch).plus(1).floor();
						let totalOther;
						if (hasMilestone("ge", 1)) totalOther = 0;
						else totalOther = Object.keys(player.ge.clickables).filter(x => (x!=this.id && x<20)).map(x => player.ge.clickables[x]).reduce((a,c) => Decimal.add(a, c));
						let target = x.sub(totalOther).max(0);
						player.ge.boosted = player.ge.boosted.max(x);
						player.ge.clickables[this.id] = Decimal.max(player.ge.clickables[this.id], target);
					} else {
						player.ge.boosted = player.ge.boosted.plus(1);
						player.ge.clickables[this.id] = Decimal.add(player.ge.clickables[this.id], 1)
					}
				},
				style: {"height": "150px", "width": "150px"},
			},
			21: {
				title: "重置齿轮升级",
				unlocked() { return player.ge.unlocked },
				canClick() { return player.ge.unlocked && player.ge.boosted.gt(0) },
				onClick() { 
					if (!confirm("你确定要重置齿轮升级吗？这会导致一次齿轮重置。")) return;
					player.ge.boosted = new Decimal(0);
					for (let i=11;i<=13;i++) player.ge.clickables[i] = "";
					doReset("ge", true);
				},
				style: {"height": "75px", "width": "100px"},
			},
		},
		milestones: {
			0: {
				requirementDescription: "1,000,000 齿轮",
				done() { return player.ge.best.gte(1e6) },
				effectDescription: "你可以最大购买齿轮升级。",
				toggles: [["ge", "maxToggle"]],
			},
			1: {
				requirementDescription: "2e22 齿轮",
				unlocked() { return player.ge.best.gte(1e6) },
				done() { return player.ge.best.gte(2e22) },
				effectDescription: "每个齿轮升级的价格增长独立计算。",
			},
			2: {
				requirementDescription: "5e47 齿轮 & 25,000,000 总能量",
				unlocked() { return player.en.unlocked },
				done() { return player.en.unlocked && player.ge.best.gte(5e47) && player.en.total.gte(25e6) },
				effectDescription: "总能量乘以齿轮获取，每秒获得 1% 的齿轮。",
			},
			3: {
				requirementDescription: "1e141 齿轮",
				unlocked() { return hasUpgrade("ai", 13) },
				done() { return hasUpgrade("ai", 13) && player.ge.best.gte(1e141) },
				effectDescription: "齿可以是小数（小于 1），齿轮进化不再强制进行第七行重置，解锁自动齿轮升级。",
				toggles: [["ge", "auto"]],
			},
		},
})
/*
                                            
                                            
                                            
                                            
                                            
                                            
   mmmmmmm    mmmmmmm       cccccccccccccccc
 mm:::::::m  m:::::::mm   cc:::::::::::::::c
m::::::::::mm::::::::::m c:::::::::::::::::c
m::::::::::::::::::::::mc:::::::cccccc:::::c
m:::::mmm::::::mmm:::::mc::::::c     ccccccc
m::::m   m::::m   m::::mc:::::c             
m::::m   m::::m   m::::mc:::::c             
m::::m   m::::m   m::::mc::::::c     ccccccc
m::::m   m::::m   m::::mc:::::::cccccc:::::c
m::::m   m::::m   m::::m c:::::::::::::::::c
m::::m   m::::m   m::::m  cc:::::::::::::::c
mmmmmm   mmmmmm   mmmmmm    cccccccccccccccc
                                            
                                            
                                            
                                            
                                            
                                            
                                            
*/
addLayer("mc", {
		name: "machines", // This is optional, only used in a few places, If absent it just uses the layer id.
        symbol: "MC", // This appears on the layer's node. Default is the id with the first letter capitalized
        position: 3, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
        startData() { return {
            unlocked: false,
			points: new Decimal(0),
			best: new Decimal(0),
			total: new Decimal(0),
			first: 0,
			mechEn: new Decimal(0),
			autoSE: false,
			auto: false,
        }},
        color: "#c99a6b",
		nodeStyle() { return {
			background: (player.mc.unlocked||canReset("mc"))?((player.grad&&!player.oldStyle)?"radial-gradient(circle, #c99a6b 0%, #706d6d 100%)":"#c99a6b"):"#bf8f8f",
		}},
		componentStyles: {
			"prestige-button": {
				background() { return (canReset("mc"))?((player.grad&&!player.oldStyle)?"radial-gradient(circle, #c99a6b 0%, #706d6d 100%)":"#c99a6b"):"#bf8f8f" },
			},
		},
        requires: new Decimal(128000), // Can be a function that takes requirement increases into account
        resource: "组件", // Name of prestige currency 
        baseResource: "星云砖", // Name of resource prestige is based on
        baseAmount() {return player.i.hb}, // Get the current amount of baseResource
        type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
        exponent: new Decimal(4), // Prestige currency exponent
        gainMult() { // Calculate the multiplier for main currency from bonuses
            mult = new Decimal(1);
			if (player.mc.upgrades.includes(11)) mult = mult.times(buyableEffect("mc", 12));
			if (hasMilestone("mc", 0)) mult = mult.times(player.ne.thoughts.max(1));
			if (hasUpgrade("ai", 33)) mult = mult.times(upgradeEffect("ai", 33));
            return mult
        },
        gainExp() { // Calculate the exponent on main currency from bonuses
            return new Decimal(1)
        },
        row: 6, // Row the layer is in on the tree (0 is the first row)
        hotkeys: [
            {key: "c", description: "按 C 进行机械重置。", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
        ],
		passiveGeneration() { return hasMilestone("mc", 0)?0.01:0 },
        doReset(resettingLayer){ 
			let keep = [];
			if (layers[resettingLayer].row > this.row) layerDataReset(this.layer, keep)
        },
        layerShown(){return player.ma.unlocked },
        branches: ["hs", "i", "id"],
		update(diff) {
			if (!player[this.layer].unlocked) return;
			player.mc.mechEn = player.mc.mechEn.plus(player.ge.rotations.times(tmp.mc.mechPer).times(diff)).times(tmp.mc.decayPower.pow(diff));
			if (hasMilestone("id", 3) && player.mc.autoSE) layers.mc.buyables[11].buyMax();
			if (hasMilestone("mc", 1) && player.mc.auto) {
				player.mc.clickables[11] = player.mc.clickables[11].max(player.mc.mechEn.times(tmp.mc.mechEnMult));
				player.mc.clickables[12] = player.mc.clickables[12].max(player.mc.mechEn.times(tmp.mc.mechEnMult));
				player.mc.clickables[21] = player.mc.clickables[21].max(player.mc.mechEn.times(tmp.mc.mechEnMult));
				player.mc.clickables[22] = player.mc.clickables[22].max(player.mc.mechEn.times(tmp.mc.mechEnMult));
			}
		},
		mechEnMult() {
			let mult = new Decimal(1);
			if (player.id.unlocked) mult = mult.times(tmp.id.revEff);
			if (player.c.unlocked) mult = mult.times(tmp.c.eff4);
			return mult;
		},
		mechPer() { return tmp.mc.buyables[11].effect.pow(tmp.mc.buyables[11].buffExp).times(clickableEffect("mc", 11)) },
		decayPower() { return player.mc.mechEn.plus(1).log10().div(hasUpgrade("ai", 31)?2:1).plus(1).pow(-2) },
		mechEff() { return Decimal.pow(10, player.mc.mechEn.plus(1).log10().root(4).div(2)) },
		tabFormat: {
			"The Shell": {
				buttonStyle() { return {'background-color': '#706d6d'} },
				content: ["main-display",
				"prestige-button",
				"resource-display", "blank",
				"milestones",
				"blank", 
				"respec-button", "blank", ["buyable", 11],
			]},
			"The Motherboard": {
				buttonStyle() { return {'background-color': '#c99a6b', color: "black"} },
				content: ["blank", ["display-text", function() { return "每齿轮转速提供 "+format(tmp.mc.mechPer)+" 机械能量，总计 <h3>"+format(player.mc.mechEn.times(tmp.mc.mechEnMult))+" 机械能量</h3>" }],
				"blank", ["display-text", function() { return tmp.mc.decayPower.eq(1)?"":("由于储存力差，每秒丢失 "+format(tmp.mc.decayPower.pow(-1).log10())+" OoMs。") }],
				"blank", ["display-text", function() { return "其增幅齿轮速度 "+format(tmp.mc.mechEff)+(tmp.nerdMode?"x (公式: 10^((log(x+1)^0.25)/2))":"x") }],
				"blank", ["upgrade", 11], "blank",
				"clickables",
			]},
			"The Core": {
				unlocked() { return player.mc.upgrades.includes(11) },
				buttonStyle() { return {'background-color': '#c76e6b', "border-color": "#c76e6b", color: "black"} },
				content: ["blank", ["buyable", 12]],
			},
		},
		milestones: {
			0: {
				requirementDescription: "125,000,000 组件 & 1e9 信号",
				unlocked() { return player.ne.unlocked && player.mc.unlocked },
				done() { return player.ne.unlocked && ((player.mc.best.gte(1.25e8) && player.ne.signals.gte(1e9)) || player.mc.milestones.includes(0)) },
				effectDescription: "思考加成组件获取，每秒获取 1% 的组件。",
			},
			1: {
				requirementDescription: "1e50,000 机械能量",
				unlocked() { return hasUpgrade("ai", 31) },
				done() { return hasUpgrade("ai", 31) && player.mc.mechEn.times(tmp.mc.mechEnMult).gte("1e50000") },
				effectDescription: "CPU 效果提升至 25 次方，解锁自动主板。",
				toggles: [["mc", "auto"]],
			},
		},
		clickables: {
			rows: 2,
			cols: 2,
			activeLimit() { return hasAchievement("a", 141)?4:(hasAchievement("a", 133)?2:1) },
			11: {
				title: "CPU",
				display() { 
					return "激活的机械能量: "+format(player.mc.clickables[this.id])+"<br><br>当前: 动能增幅机械能量获取 "+format(tmp.mc.clickables[this.id].effect)+(tmp.nerdMode?"x (公式: (kineticEnergy+1)^(1-1/sqrt(log(activeMechEnergy+1)+1)))":"x");
				},
				effect() { 
					let eff = Decimal.pow(player.ge.energy.plus(1), Decimal.sub(1, Decimal.div(1, Decimal.add(player.mc.clickables[this.id], 1).log10().plus(1).sqrt())));
					if (hasMilestone("mc", 1)) eff = eff.pow(25);
					if (!eff.eq(eff)) return new Decimal(1);
					return eff;
				},
				unlocked() { return player.mc.unlocked },
				canClick() { return player.mc.unlocked },
				onClick() {
					if (player.mc.clickables[this.id].eq(0)) {
						let activeClickables = Object.values(player.mc.clickables).filter(x => Decimal.gt(x, 0)).length;
						if (activeClickables>=tmp.mc.clickables.activeLimit) {
							player.mc.clickables = getStartClickables("mc");
							doReset("mc", true);
						}
					}
					player.mc.clickables[this.id] = player.mc.clickables[this.id].max(player.mc.mechEn.times(tmp.mc.mechEnMult));
					player.mc.mechEn = new Decimal(0);
				},
				style: {id: "11", "height": "200px", "width": "200px", "background-color": function() { return new Decimal(player.mc.clickables[this.id]).eq(0)?"#c99a6b":"#6ccc81" }},
			},
			12: {
				title: "接口",
				display() { 
					return "激活的机械能量: "+format(player.mc.clickables[this.id])+"<br><br>当前: 幽魂增幅齿轮获取 "+format(tmp.mc.clickables[this.id].effect)+(tmp.nerdMode?"x (公式: (phantomSouls+1)^(1-1/sqrt(log(activeMechEnergy+1)+1)))":"x");
				},
				effect() { return Decimal.pow(player.ps.points.plus(1), Decimal.sub(1, Decimal.div(1, Decimal.add(player.mc.clickables[this.id], 1).log10().plus(1).sqrt()))) },
				unlocked() { return player.mc.unlocked },
				canClick() { return player.mc.unlocked },
				onClick() {
					if (player.mc.clickables[this.id].eq(0)) {
						let activeClickables = Object.values(player.mc.clickables).filter(x => Decimal.gt(x, 0)).length;
						if (activeClickables>=tmp.mc.clickables.activeLimit) {
							player.mc.clickables = getStartClickables("mc");
							doReset("mc", true);
						}
					}
					player.mc.clickables[this.id] = player.mc.clickables[this.id].max(player.mc.mechEn.times(tmp.mc.mechEnMult));
					player.mc.mechEn = new Decimal(0);
				},
				style: {id: "12", "height": "200px", "width": "200px", "background-color": function() { return new Decimal(player.mc.clickables[this.id]).eq(0)?"#c99a6b":"#6ccc81" }},
			},
			21: {
				title: "北桥",
				display() { 
					return "激活的机械能量: "+format(player.mc.clickables[this.id])+"<br><br>当前: 阳光增幅超级生成器底数 "+format(tmp.mc.clickables[this.id].effect)+(tmp.nerdMode?"x (公式: (solarity+1)^("+formatWhole(tmp.mc.clickables[this.id].effExp)+"-"+formatWhole(tmp.mc.clickables[this.id].effExp)+"/((log(activeMechEnergy+1)+1)^0.125)))":"x");
				},
				effExp() { return hasAchievement("a", 133)?3:1 },
				effect() { return Decimal.pow(player.o.points.plus(1), Decimal.sub(tmp.mc.clickables[this.id].effExp, Decimal.div(tmp.mc.clickables[this.id].effExp, Decimal.add(player.mc.clickables[this.id], 1).log10().plus(1).root(8)))) },
				unlocked() { return player.mc.unlocked },
				canClick() { return player.mc.unlocked },
				onClick() {
					if (player.mc.clickables[this.id].eq(0)) {
						let activeClickables = Object.values(player.mc.clickables).filter(x => Decimal.gt(x, 0)).length;
						if (activeClickables>=tmp.mc.clickables.activeLimit) {
							player.mc.clickables = getStartClickables("mc");
							doReset("mc", true);
						}
					}
					player.mc.clickables[this.id] = player.mc.clickables[this.id].max(player.mc.mechEn.times(tmp.mc.mechEnMult));
					player.mc.mechEn = new Decimal(0);
				},
				style: {id: "21", "height": "200px", "width": "200px", "background-color": function() { return new Decimal(player.mc.clickables[this.id]).eq(0)?"#c99a6b":"#6ccc81" }},
			},
			22: {
				title: "南桥",
				display() { 
					return "激活的机械能量: "+format(player.mc.clickables[this.id])+"<br><br>当前: 超空间能量加成平衡获取 "+format(tmp.mc.clickables[this.id].effect)+(tmp.nerdMode?"x (公式: (hyperspaceEnergy+1)^(1-1/cbrt(log(activeMechEnergy+1)+1)))":"x");
				},
				effect() { return Decimal.pow(player.hs.points.plus(1), Decimal.sub(1, Decimal.div(1, Decimal.add(player.mc.clickables[this.id], 1).log10().plus(1).cbrt()))) },
				unlocked() { return player.mc.unlocked },
				canClick() { return player.mc.unlocked },
				onClick() {
					if (player.mc.clickables[this.id].eq(0)) {
						let activeClickables = Object.values(player.mc.clickables).filter(x => Decimal.gt(x, 0)).length;
						if (activeClickables>=tmp.mc.clickables.activeLimit) {
							player.mc.clickables = getStartClickables("mc");
							doReset("mc", true);
						}
					}
					player.mc.clickables[this.id] = player.mc.clickables[this.id].max(player.mc.mechEn.times(tmp.mc.mechEnMult));
					player.mc.mechEn = new Decimal(0);
				},
				style: {id: "22", "height": "200px", "width": "200px", "background-color": function() { return new Decimal(player.mc.clickables[this.id]).eq(0)?"#c99a6b":"#6ccc81" }},
			},
		},
		buyables: {
			showRespec() { return player.mc.unlocked },
            respec() { // Optional, reset things and give back your currency. Having this function makes a respec button appear
                resetBuyables(this.layer)
                doReset(this.layer, true) // Force a reset
            },
			rows: 1,
			cols: 2,
			11: {
				title: "命令行扩展",
				costDiv() { return new Decimal(hasAchievement("a", 132)?7:1) },
				cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                    return x.div(10).plus(0.5).div(tmp[this.layer].buyables[this.id].costDiv).ceil();
                },
				buffExp() { 
					let exp = hasAchievement("a", 132)?25:5;
					if (hasUpgrade("ai", 33)) exp *= 100;
					return exp;
				},
				effect() { return player[this.layer].buyables[this.id].plus(1).sqrt() },
				display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id];
					let cost = data.cost;
					let amt = player[this.layer].buyables[this.id];
                    let display = "需要: "+formatWhole(cost)+" 组件"+(tmp.nerdMode?" (价格公式: floor((x/10+0.5)^1.1)":"")+".<br><br><h3>当前命令行大小: "+formatWhole(amt)+"m</h3>，加成机械能量获取 "+format(data.effect.pow(data.buffExp))+(tmp.nerdMode?" (公式: (x+1)^2.5)":"")+" "+(hasAchievement("a", 125)?"并除以":"但乘以")+"齿轮的齿大小 "+format(data.effect)+(tmp.nerdMode?" (公式: sqrt(x+1))":"");
					return display;
                },
                unlocked() { return unl(this.layer) }, 
                canAfford() {
					let cost = tmp[this.layer].buyables[this.id].cost
                    return player[this.layer].unlocked && player.mc.points.gte(cost);
				},
                buy() { 
					let b = player[this.layer].buyables[this.id];
					let c = player.mc.points.times(tmp[this.layer].buyables[this.id].costDiv);
					let n = b.pow(2).times(4).plus(b.times(36)).plus(c.times(80)).plus(81).sqrt().sub(11).div(2).plus(1).floor();
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].max(n)
					 if (n.sub(b).eq(1)) 
						player.mc.points = player.mc.points.sub(tmp[this.layer].buyables[this.id].cost);
					else player.mc.points = player.mc.points.sub(n.sub(b).times(b.plus(n).plus(10)).times(0.05).max(n.sub(b)).div(tmp[this.layer].buyables[this.id].costDiv).floor()).max(0);
                },
				buyMax() {
					let c = player.mc.points.times(tmp[this.layer].buyables[this.id].costDiv);
					let n = c.sub(.5).times(10).plus(1).floor().max(0);
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].max(n);
				},
                style: {'height':'200px', 'width':'200px'},
				autoed() { return hasMilestone("id", 3) && player.mc.autoSE },
			},
			12: {
				title: "核心",
				cost(x=player[this.layer].buyables[this.id]) {
					if (x.gte(4)) x = x.pow(4).div(64);
					return Decimal.pow(10, Decimal.pow(1.5, x.plus(1).cbrt()).times(3e14))
				},
				effect() { return player[this.layer].buyables[this.id].times(1e4).plus(1).pow(.56) },
				display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id];
					let cost = data.cost;
					let amt = player[this.layer].buyables[this.id];
                    let display = "价格: "+format(cost)+" 点数"+(tmp.nerdMode?" (价格公式: 10^((1.5^cbrt("+(amt.gte(4)?"(x^4)/64":"x")+"+1))*3e14)":"")+".<br><br>等级: "+formatWhole(amt)+"<br><br>效果: GP 效果提升 ^"+format(data.effect)+"，齿轮获取、组件获取以及齿轮速度乘以 "+format(data.effect)+(tmp.nerdMode?" (公式: (10,000*level+1)^0.56)":"");
					return display;
                },
                unlocked() { return unl(this.layer) && player.mc.upgrades.includes(11) }, 
                canAfford() {
					if (!tmp[this.layer].buyables[this.id].unlocked) return false;
					let cost = tmp[this.layer].buyables[this.id].cost
                    return player[this.layer].unlocked && player.points.gte(cost);
				},
                buy() { 
					player.points = player.points.sub(tmp[this.layer].buyables[this.id].cost)
					player.mc.buyables[this.id] = player.mc.buyables[this.id].plus(1);
                },
                style: {'height':'250px', 'width':'250px', 'background-color'() { return tmp.mc.buyables[12].canAfford?'#c76e6b':'#bf8f8f' }, "border-color": "#c76e6b"},
				autoed() { return false },
			},
		},
		upgrades: {
			rows: 1,
			cols: 1,
			11: {
				title: "解锁核心",
				unlocked() { return !player.mc.upgrades.includes(11) },
				multiRes: [
					{
						cost: new Decimal(5e3),
					},
					{
						currencyDisplayName: "机械能量",
						currencyInternalName: "mechEn",
						currencyLayer: "mc",
						cost: new Decimal("1e420"),
					},
				],
			},
		},
})
/*
                                      
                                      
                                      
                                      
                                      
                                      
    eeeeeeeeeeee    nnnn  nnnnnnnn    
  ee::::::::::::ee  n:::nn::::::::nn  
 e::::::eeeee:::::een::::::::::::::nn 
e::::::e     e:::::enn:::::::::::::::n
e:::::::eeeee::::::e  n:::::nnnn:::::n
e:::::::::::::::::e   n::::n    n::::n
e::::::eeeeeeeeeee    n::::n    n::::n
e:::::::e             n::::n    n::::n
e::::::::e            n::::n    n::::n
 e::::::::eeeeeeee    n::::n    n::::n
  ee:::::::::::::e    n::::n    n::::n
    eeeeeeeeeeeeee    nnnnnn    nnnnnn
                                      
                                      
                                      
                                      
                                      
                                      
                                      
*/
addLayer("en", {
		name: "energy", // This is optional, only used in a few places, If absent it just uses the layer id.
        symbol: "EN", // This appears on the layer's node. Default is the id with the first letter capitalized
        position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
        startData() { return {
            unlocked: false,
			points: new Decimal(0),
			best: new Decimal(0),
			bestOnReset: new Decimal(0),
			total: new Decimal(0),
			stored: new Decimal(0),
			target: 0,
			tw: new Decimal(0),
			ow: new Decimal(0),
			sw: new Decimal(0),
			mw: new Decimal(0),
			first: 0,
        }},
        color: "#fbff05",
		nodeStyle() {return {
			"background-color": (((player.en.unlocked||canReset("en"))&&!(Array.isArray(tmp.ma.canBeMastered)&&player.ma.selectionActive&&tmp[this.layer].row<tmp.ma.rowLimit&&!tmp.ma.canBeMastered.includes(this.layer)))?"#fbff05":"#bf8f8f"),
        }},
        resource: "能量", // Name of prestige currency
        type: "custom", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
		baseResource: "阳光",
		baseAmount() { return player.o.points },
		req() { return (player[this.layer].unlockOrder>0&&!player.en.unlocked)?new Decimal("1e15825"):new Decimal("1e15000") },
		requires() { return this.req() },
		increaseUnlockOrder: ["ne"],
		exp() { return Decimal.add(.8, tmp.en.clickables[11].eff) },
		exponent() { return tmp[this.layer].exp },
		gainMult() {
			let mult = new Decimal(1);
			if (hasMilestone("en", 0)) mult = mult.times(2);
			if (hasMilestone("en", 2)) mult = mult.times(player.o.points.plus(1).log10().plus(1).log10().plus(1));
			if (player.ne.unlocked && hasMilestone("ne", 5)) mult = mult.times(tmp.ne.thoughtEff3);
			if (player.r.unlocked) mult = mult.times(tmp.r.producerEff);
			if (hasMilestone("r", 0)) mult = mult.times(player.r.maxMinibots.max(1));
			if (player.ai.unlocked && tmp.ai) mult = mult.times(tmp.ai.conscEff1);
			return mult;
		},
		getResetGain() {
			let gain = player.o.points.div(tmp.en.req).plus(1).log2().pow(tmp.en.exp);
			return gain.times(tmp.en.gainMult).floor();
		},
		resetGain() { return this.getResetGain() },
		getNextAt() {
			let gain = tmp.en.getResetGain.div(tmp.en.gainMult).plus(1)
			return Decimal.pow(2, gain.root(tmp.en.exp)).times(tmp.en.req);
		},
		passiveGeneration() { return hasMilestone("en", 0)?0.1:0 },
		canReset() {
			return player.o.points.gte(tmp.en.req) && tmp.en.getResetGain.gt(0) && (hasMilestone("en", 0)?player.en.points.lt(tmp.en.getResetGain):player.en.points.eq(0))
		},
		dispGainFormula() {
			let start = tmp.en.req;
			let exp = tmp.en.exp;
			return "log2(x / "+format(start)+")^"+format(exp)
		},
		prestigeButtonText() {
			if (tmp.nerdMode) return "获取公式: "+tmp.en.dispGainFormula;
			else return `${ player.en.points.lt(1e3) ? (tmp.en.resetDescription !== undefined ? tmp.en.resetDescription : "重置获得 ") : ""}+<b>${formatWhole(tmp.en.getResetGain)}</b> ${tmp.en.resource} ${tmp.en.resetGain.lt(100) && player.en.points.lt(1e3) ? `<br><br>下一个位于 ${format(tmp.en.nextAt)}` : ""}`
		},
		prestigeNotify() {
			if (!canReset("en")) return false;
			if (tmp.en.getResetGain.gte(player.o.points.times(0.1).max(1)) && !tmp.en.passiveGeneration) return true;
			else return false;
		},
		tooltip() { return formatWhole(player.en.points)+" 能量" },
		tooltipLocked() { return "达到 "+formatWhole(tmp.en.req)+" 阳光解锁（你有 "+formatWhole(player.o.points)+" 阳光）" },
        row: 4, // Row the layer is in on the tree (0 is the first row)
        hotkeys: [
            {key: "y", description: "按 Y 进行能量重置", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
        ],
        doReset(resettingLayer){ 
			let keep = [];
			if (resettingLayer==this.layer) player.en.target = player.en.target%(hasMilestone("en", 3)?4:3)+1;
			if (layers[resettingLayer].row<7 && resettingLayer!="r" && resettingLayer!="ai" && resettingLayer!="c") {
				keep.push("tw");
				keep.push("sw");
				keep.push("ow");
				keep.push("mw");		
				if (hasMilestone("en", 1)) keep.push("milestones");
			}
			if (layers[resettingLayer].row > this.row) layerDataReset(this.layer, keep)
        },
		onPrestige(gain) { player.en.bestOnReset = player.en.bestOnReset.max(gain) },
        layerShown(){return player.mc.unlocked },
        branches: ["sb","o"],
		update(diff) {
			if (!player[this.layer].unlocked) return;
			let subbed = new Decimal(0);
			if (player.en.points.gt(0)) {
				subbed = player.en.points.times(Decimal.sub(1, Decimal.pow(0.75, diff))).plus(diff);
				player.en.points = player.en.points.times(Decimal.pow(0.75, diff)).sub(diff).max(0);
				if (hasMilestone("en", 1)) player.en.stored = player.en.stored.plus(subbed.div(5));
			}
			let sw_mw_exp = hasUpgrade("ai", 34)?0.8:1
			if (hasMilestone("r", 1)) {
				subbed = subbed.times(player.r.total.max(1));
				if (hasMilestone("r", 4) && tmp.r) subbed = subbed.times(tmp.r.producerEff.max(1));
				player.en.tw = player.en.tw.pow(1.5).plus(subbed.div(player.en.target==1?1:3)).root(1.5);
				player.en.ow = player.en.ow.pow(1.5).plus(subbed.div(player.en.target==2?1:3)).root(1.5);
				player.en.sw = player.en.sw.pow(sw_mw_exp*(hasMilestone("en", 4)?2.5:4)).plus(subbed.div(player.en.target==3?1:3)).root(sw_mw_exp*(hasMilestone("en", 4)?2.5:4));
				if (hasMilestone("en", 3)) player.en.mw = player.en.mw.pow(sw_mw_exp*(hasMilestone("en", 4)?5.5:7)).plus(subbed.div(player.en.target==4?1:3)).root(sw_mw_exp*(hasMilestone("en", 4)?5.5:7));
				
			} else switch(player.en.target) {
				case 1: 
					player.en.tw = player.en.tw.pow(1.5).plus(subbed).root(1.5);
					break;
				case 2: 
					player.en.ow = player.en.ow.pow(1.5).plus(subbed).root(1.5);
					break;
				case 3: 
					player.en.sw = player.en.sw.pow(sw_mw_exp*(hasMilestone("en", 4)?2.5:4)).plus(subbed).root(sw_mw_exp*(hasMilestone("en", 4)?2.5:4));
					break;
				case 4: 
					if (hasMilestone("en", 3)) player.en.mw = player.en.mw.pow(sw_mw_exp*(hasMilestone("en", 4)?5.5:7)).plus(subbed).root(sw_mw_exp*(hasMilestone("en", 4)?5.5:7));
					break;
			}
		},
		storageLimit() { return player.en.total.div(2) },
		twEff() { return player.en.tw.plus(1).log10().plus(1).log10().times(10).plus(1).pow(4) },
		owEff() { return player.en.ow.plus(1).log10().plus(1).log10().times(40).pow(1.8) },
		swEff() { return player.en.sw.plus(1).log10().plus(1).log10().plus(1).log10().plus(1) },
		mwEff() { return hasMilestone("en", 3)?player.en.mw.plus(1).log10().plus(1).log10().div(5).plus(1).pow(2):new Decimal(1) },
		tabFormat: ["main-display",
			"prestige-button",
			"resource-display", "blank",
			"milestones",
			"blank", "blank", 
			"clickables",
			"blank", "blank",
			["row", [
				["column", [["display-text", function() { return "<h3 style='color: "+(player.en.target==1?"#e1ffde;":"#8cfa82;")+"'>"+(player.en.target==1?"时间能量":"时间能量")+"</h3>" }], ["display-text", function() { return "<h4 style='color: #8cfa82;'>"+formatWhole(player.en.tw)+"</h4><br><br>增强非扩展时空胶囊 <span style='color: #8cfa82; font-weight: bold; font-size: 20px;'>"+format(tmp.en.twEff.sub(1).times(100))+"</span>%" }]], {width: "100%"}],
				]], "blank", "blank", ["row", [
				["column", [["display-text", function() { return "<h3 style='color: "+(player.en.target==2?"#fff0d9":"#ffd187;")+"'>"+(player.en.target==2?"太阳能量":"太阳能量")+"</h3>" }], ["display-text", function() { return "<h4 style='color: #ffd187;'>"+formatWhole(player.en.ow)+"</h4><br><br>对阳光获取指数增加 <span style='color: #ffd187; font-weight: bold; font-size: 20px;'>"+format(tmp.en.owEff)+"</span>" }]], {width: "50%"}],
				["column", [["display-text", function() { return "<h3 style='color: "+(player.en.target==3?"#dbfcff":"#8cf5ff;")+"'>"+(player.en.target==3?"超级能量":"超级能量")+"</h3>" }], ["display-text", function() { return "<h4 style='color: #8cf5ff;'>"+formatWhole(player.en.sw)+"</h4><br><br>增强超级增幅器 <span style='color: #8cf5ff; font-weight: bold: font-size: 20px;'>"+format(tmp.en.swEff.sub(1).times(100))+"</span>%" }]], {width: "50%"}],
				]], "blank", "blank", ["row", [
				["column", [["display-text", function() { return hasMilestone("en", 3)?("<h3 style='color: "+(player.en.target==4?"#f4deff;":"#d182ff;")+"'>"+(player.en.target==4?"思维能量":"思维能量")+"</h3>"):"" }], ["display-text", function() { return hasMilestone("en", 3)?("<h4 style='color: #d182ff;'>"+formatWhole(player.en.mw)+"</h4><br><br>增强思考效果 <span style='color: #d182ff; font-weight: bold; font-size: 20px;'>"+format(tmp.en.mwEff.sub(1).times(100))+"</span>%，并且增幅信号获取 <span style='color: #d182ff; font-weight: bold; font-size: 20px;'>"+format(tmp.en.mwEff.pow(40))+"</span>x"):"" }]], {width: "75%"}],
			], function() { return {display: hasMilestone("en", 3)?"none":""} }],
			"blank", "blank", "blank",
		],
		milestones: {
			0: {
				requirementDescription: "一次重置获得 8,750 能量",
				done() { return player.en.bestOnReset.gte(8750) || hasAchievement("a", 151) },
				effectDescription: "每秒获得 10% 的能量，小于 100% 获得的能量时就可以进行能量重置，双倍能量获取。",
			},
			1: {
				requirementDescription: "一次重置获得 22,500 能量",
				done() { return player.en.bestOnReset.gte(22500) || hasAchievement("a", 151) },
				effectDescription: "流失的 20% 能量转换为储存，能量里程碑对于第七行重置保留（除了机器人和人工智能），小于 1 时，储存能量效果被根号。",
			},
			2: {
				requirementDescription: "一次重置获得 335,000 能量",
				done() { return player.en.bestOnReset.gte(335e3) || hasAchievement("a", 151) },
				effectDescription() { return "你阳光的两次 log 加成能量获取  ("+format(player.o.points.plus(1).log10().plus(1).log10().plus(1))+"x)." },
			},
			3: {
				unlocked() { return player.en.unlocked && player.ne.unlocked },
				requirementDescription: "250,000,000 总能量 & 26 思考",
				done() { return (player.en.total.gte(2.5e8) && player.ne.thoughts.gte(26)) || player.en.milestones.includes(3) },
				effectDescription() { return "解锁思维能量。" },
			},
			4: {
				unlocked() { return hasMilestone("en", 3) || hasAchievement("a", 151) },
				requirementDescription: "一次重置获得 10,000,000 能量",
				done() { return player.en.bestOnReset.gte(1e7) || hasAchievement("a", 151) },
				effectDescription() { return "思维能量 & 超级能量获取根降低 1.5。" },
			},
		},
		clickables: {
			rows: 1,
			cols: 2,
			11: {
				title: "储存能量",
				display(){
					return "储存的能量: <span style='font-size: 20px; font-weight: bold;'>"+formatWhole(player.en.stored)+" / "+formatWhole(tmp.en.storageLimit)+"</span><br><br>"+(tmp.nerdMode?("效果公式: log(log(x+1)+1)/5"):("能量获取指数增加 <span style='font-size: 20px; font-weight: bold;'>"+format(tmp.en.clickables[11].eff)+"</span>"))
				},
				eff() { 
					let e = player.en.stored.plus(1).log10().plus(1).log10().div(5);
					if (hasMilestone("en", 1) && e.lt(1)) e = e.sqrt();
					return e;
				},
				unlocked() { return player.en.unlocked },
				canClick() { return player.en.unlocked && player.en.points.gt(0) },
				onClick() { 
					player.en.stored = player.en.stored.plus(player.en.points).min(tmp.en.storageLimit);
					player.en.points = new Decimal(0);
				},
				style: {width: "160px", height: "160px"},
			},
			12: {
				title: "释放能量",
				display: "",
				unlocked() { return player.en.unlocked },
				canClick() { return player.en.unlocked && player.en.stored.gt(0) },
				onClick() { 
					player.en.points = player.en.points.plus(player.en.stored);
					player.en.best = player.en.best.max(player.en.points);
					player.en.stored = new Decimal(0);
				},
				style: {width: "80px", height: "80px"},
			},
		},
})
/*
                                      
                                      
                                      
                                      
                                      
                                      
nnnn  nnnnnnnn        eeeeeeeeeeee    
n:::nn::::::::nn    ee::::::::::::ee  
n::::::::::::::nn  e::::::eeeee:::::ee
nn:::::::::::::::ne::::::e     e:::::e
  n:::::nnnn:::::ne:::::::eeeee::::::e
  n::::n    n::::ne:::::::::::::::::e 
  n::::n    n::::ne::::::eeeeeeeeeee  
  n::::n    n::::ne:::::::e           
  n::::n    n::::ne::::::::e          
  n::::n    n::::n e::::::::eeeeeeee  
  n::::n    n::::n  ee:::::::::::::e  
  nnnnnn    nnnnnn    eeeeeeeeeeeeee  
                                      
                                      
                                      
                                      
                                      
                                      
                                      
*/
addLayer("ne", {
		name: "neurons", // This is optional, only used in a few places, If absent it just uses the layer id.
        symbol: "NE", // This appears on the layer's node. Default is the id with the first letter capitalized
        position: 4, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
        startData() { return {
            unlocked: false,
			points: new Decimal(0),
			best: new Decimal(0),
			first: 0,
			signals: new Decimal(0),
			thoughts: new Decimal(0),
			auto: false,
			autoNN: false,
        }},
        color: "#ded9ff",
        requires() { return (player[this.layer].unlockOrder>0&&!player.ne.unlocked)?new Decimal("1e1160000"):new Decimal("1e1000000") }, // Can be a function that takes requirement increases into account
		increaseUnlockOrder: ["en"],
        resource: "神经元", // Name of prestige currency
        baseResource: "子空间", // Name of resource prestige is based on
        baseAmount() {return player.ss.subspace}, // Get the current amount of baseResource
        type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
        exponent: new Decimal(2.5), // Prestige currency exponent
		base: new Decimal("1e10000"),
        gainMult() { // Calculate the multiplier for main currency from bonuses
            mult = new Decimal(1)
            return mult
        },
		canBuyMax() { return false },
        row: 4, // Row the layer is in on the tree (0 is the first row)
        hotkeys: [
            {key: "u", description: "按 U 进行神经元重置", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
        ],
		resetsNothing() { return player.ne.auto },
        doReset(resettingLayer){ 
			let keep = [];
			if (layers[resettingLayer].row<7&&resettingLayer!="id"&&resettingLayer!="ai"&&resettingLayer!="c") {
				keep.push("thoughts")
				keep.push("buyables")
				if (hasMilestone("ne", 1)) keep.push("milestones");
			}
            if (layers[resettingLayer].row > this.row) layerDataReset(this.layer, keep)
        },
		effect() {
			let eff = player[this.layer].points.div(2).plus(1).pow(0.75).sub(1);
			if (hasMilestone("ne", 3)) eff = eff.times(Decimal.pow(1.5, player[this.layer].points.sqrt()).plus(player[this.layer].points));
			if (hasMilestone("ne", 6)) eff = eff.pow(2);
			if (hasMilestone("id", 1)) eff = eff.pow(2).times(player[this.layer].buyables[11].max(1));
			return eff;
		},
		effectDescription() { return "将信号获取速度乘以 <h2 style='color: #ded9ff; text-shadow: #ded9ff 0px 0px 10px;'>"+format(tmp[this.layer].effect)+"</h2>。" },
		autoPrestige() { return player.ne.auto },
        layerShown(){return player.mc.unlocked},
        branches: ["ss", "sg"],
		update(diff) {
			if (player.ne.unlocked && (player.ne.activeChallenge==11||hasAchievement("a", 151))) {
				player.ne.signals = player.ne.signals.plus(tmp.ne.challenges[11].amt.times(diff)).min((hasMilestone("ne", 4)||hasMilestone("id", 0))?(1/0):tmp.ne.signalLim);
				if (player.ne.signals.gte(tmp.ne.signalLim.times(0.999))) {
					if (hasMilestone("id", 0)) player.ne.thoughts = player.ne.thoughts.max(tmp.ne.thoughtTarg);
					else {
						if (!hasMilestone("ne", 4) && !hasUpgrade("ai", 14)) player.ne.signals = new Decimal(0);
						player.ne.thoughts = player.ne.thoughts.plus(1);
					}
				}
				if (player.ne.autoNN && hasMilestone("ne", 7)) layers.ne.buyables[11].buyMax();
			}
		},
		signalLimThresholdInc() {
			let inc = new Decimal(hasMilestone("ne", 4)?2:(hasMilestone("ne", 3)?2.5:(hasMilestone("ne", 2)?3:5)));
			if (player.id.unlocked) inc = inc.sub(tmp.id.effect);
			return inc;
		},
		signalLimThresholdDiv() {
			let div = new Decimal(1);
			if (player.c.unlocked && tmp.c) div = div.times(tmp.c.eff2);
			return div;
		},
		signalLim() { return Decimal.pow(tmp[this.layer].signalLimThresholdInc, player.ne.thoughts).times(100).div(tmp[this.layer].signalLimThresholdDiv) },
		thoughtTarg() { return player.ne.signals.times(tmp[this.layer].signalLimThresholdDiv).div(100).max(1).log(tmp[this.layer].signalLimThresholdInc).plus(1).floor() },
		thoughtPower() {
			let pow = new Decimal(1);
			if (player.en.unlocked && hasMilestone("en", 3)) pow = pow.times(tmp.en.mwEff);
			if (hasMilestone("id", 1)) pow = pow.times(1.2);
			return pow;
		},
		thoughtEff1() { return player.ne.thoughts.times(tmp.ne.thoughtPower).plus(1).log10().plus(1).pow(hasMilestone("ne", 1)?2:1) },
		thoughtEff2() { return Decimal.pow("1e800", player.ne.thoughts.times(tmp.ne.thoughtPower).pow(.75)).pow(hasMilestone("ne", 2)?2:1) },
		thoughtEff3() { return Decimal.pow(1.2, player.ne.thoughts.times(hasMilestone("ne", 5)?tmp.ne.thoughtPower:0).sqrt()) },
		challenges: {
			rows: 1,
			cols: 1,
			11: {
				name: "大脑",
				challengeDescription: "声望升级 2、增幅器、生成器禁用。<br>",
				unlocked() { return player.ne.unlocked && player.ne.points.gt(0) },
				goal() { return new Decimal(1/0) },
				currencyDisplayName: "",
				currencyInternalName: "points",
				gainMult() { 
					let mult = tmp.ne.effect.times(player.ne.signals.plus(1).log10().plus(1));
					if (hasMilestone("ne", 0)) mult = mult.times(player.ss.points.plus(1).sqrt());
					if (hasMilestone("ne", 2)) mult = mult.times(player.ne.points.max(1));
					if (player.en.unlocked && hasMilestone("en", 3)) mult = mult.times(tmp.en.mwEff.pow(40));
					if (hasAchievement("a", 143)) mult = mult.times(3);
					if (hasMilestone("r", 0)) mult = mult.times(player.r.maxMinibots.max(1));
					if (hasMilestone("r", 4) && tmp.r) mult = mult.times(tmp.r.producerEff.max(1));
					if (hasMilestone("id", 3) && tmp.mc) mult = mult.times(Decimal.pow(2, player.mc.buyables[11].max(1).log10()));
					if (player.ai.unlocked && tmp.ai) mult = mult.times(tmp.ai.conscEff1);
					if (player.c.unlocked && tmp.c) mult = mult.times(tmp.c.eff3);
					if (hasUpgrade("ai", 42)) mult = mult.times(upgradeEffect("ai", 42));
					return mult;
				},
				amt() { 
					let a = Decimal.pow(10, player.points.plus(1).log10().plus(1).log10().div(player.ne.activeChallenge==11?11:14).pow(3)).pow(tmp.ne.buyables[11].effect).times(tmp.ne.challenges[11].gainMult).floor();
					if (!a.eq(a)) return new Decimal(0);
					return a;
				},
				next() { return Decimal.pow(10, Decimal.pow(10, new Decimal((player.ne.activeChallenge==11||hasAchievement("a", 151))?tmp.ne.challenges[11].amt:0).plus(1).div(tmp.ne.challenges[11].gainMult).root(tmp.ne.buyables[11].effect).log10().root(3).times(11)).sub(1)).sub(1) },
				rewardDescription() { return "<br>信号: <h3 style='color: #ded9ff'>"+formatWhole(player.ne.signals)+"/"+formatWhole(tmp.ne.signalLim)+"</h3> "+(tmp.nerdMode?("(获取公式: 10^((log(log(points+1)+1)/11)^3)*"+format(tmp.ne.challenges[11].gainMult)+")"):("(+"+formatWhole((player.ne.activeChallenge==11||hasAchievement("a", 151))?tmp.ne.challenges[11].amt:0)+"/s"+(tmp.ne.challenges[11].amt.lt(1e3)?(", 下一个获取于 "+format(tmp.ne.challenges[11].next)+" 点数)"):")")))+"<br><br><br>思考: <h3 style='color: #ffbafa'>"+formatWhole(player.ne.thoughts)+"</h3> (下一个位于 "+formatWhole(tmp.ne.signalLim)+" 信号)<br><br>效果"+(tmp.ne.thoughtPower.eq(1)?"":(" (力量: "+format(tmp.ne.thoughtPower.times(100))+"%)"))+"<br>降低子空间能量价格 "+(tmp.nerdMode?" (公式: (log(思考+1)+1)"+(hasMilestone("ne", 1)?"^2":"")+")":(format(tmp.ne.thoughtEff1)+"x"))+"<br>子空间和超级生成器底数乘以 "+(tmp.nerdMode?" (公式: (1e800^(思考^0.75))"+(hasMilestone("ne", 2)?"^2":"")+")":format(tmp.ne.thoughtEff2)+"x")+(hasMilestone("ne", 5)?("<br>能量获取乘以 "+(tmp.nerdMode?" (公式: (1.2^sqrt(思考)))":(format(tmp.ne.thoughtEff3)+"x"))):"") },
				style() { return {'background-color': "#484659", filter: "brightness("+(100+player.ne.signals.plus(1).log10().div(tmp.ne.signalLim.plus(1).log10()).times(50).toNumber())+"%)", color: "white", 'border-radius': "25px", height: "400px", width: "400px"}},
				onStart(testInput=false) {
					if (testInput && player.ne.auto) {
						doReset("m", true);
						player.ne.activeChallenge = 11;
						updateTemp();
					}
				},
			},
		},
		buyables: {
			rows: 1,
			cols: 1,
			11: {
				title: "神经网络",
				ss() { return hasMilestone("id", 0)?12:10 },
				cost(x=player[this.layer].buyables[this.id]) {
					if (x.gte(tmp[this.layer].buyables[this.id].ss)) x = Decimal.pow(tmp[this.layer].buyables[this.id].ss, x.log(tmp[this.layer].buyables[this.id].ss).pow(hasMilestone("id", 0)?Math.sqrt(2):2));
					return Decimal.pow(4, x.pow(1.2)).times(2e4);
				},
				bulk(r=player.ne.signals) {
					let b = r.div(2e4).max(1).log(4).root(1.2);
					if (b.gte(tmp[this.layer].buyables[this.id].ss)) b = Decimal.pow(tmp[this.layer].buyables[this.id].ss, b.log(tmp[this.layer].buyables[this.id].ss).root(hasMilestone("id", 0)?Math.sqrt(2):2));
					return b.plus(1).floor();
				},
				power() {
					let p = new Decimal(hasUpgrade("ai", 11)?1.5:1);
					if (player.c.unlocked && tmp.c) p = p.times(tmp.c.eff5);
					return p;
				},
				effect() { return player[this.layer].buyables[this.id].times(tmp.ne.buyables[11].power).div(3).plus(1) },
				display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id];
					let cost = data.cost;
					let amt = player[this.layer].buyables[this.id];
                    let display = "价格: "+format(cost)+" 信号"+(tmp.nerdMode?(" (价格公式: 4^("+(amt.gte(data.ss)?(formatWhole(data.ss)+"^(log"+formatWhole(data.ss)+"(x)^"+format(hasMilestone("id", 0)?Math.sqrt(2):2)+")"):"x")+"^1.2)*2e4)"):"")+".<br><br>等级: "+formatWhole(amt)+"<br><br>效果: 从点数获取的信号提高到 "+format(data.effect)+(tmp.nerdMode?" 次幂 (公式: x/3+1)":" 次幂");
					return display;
                },
                unlocked() { return unl(this.layer) && hasMilestone("ne", 0) }, 
                canAfford() {
					if (!tmp[this.layer].buyables[this.id].unlocked) return false;
                    return player[this.layer].unlocked && player.ne.signals.gte(layers[this.layer].buyables[this.id].cost());
				},
                buy() { 
					player.ne.signals = player.ne.signals.sub(tmp[this.layer].buyables[this.id].cost).max(0)
					player.ne.buyables[this.id] = player.ne.buyables[this.id].plus(1);
                },
				buyMax() { player.ne.buyables[this.id] = player.ne.buyables[this.id].max(tmp.ne.buyables[11].bulk) },
                style: {'height':'250px', 'width':'250px', 'background-color'() { return tmp.ne.buyables[11].canAfford?'#a2cade':'#bf8f8f' }, "border-color": "#a2cade"},
				autoed() { return hasMilestone("ne", 7)&&player.ne.autoNN },
			},
		},
		milestones: {
			0: {
				requirementDescription: "2,750 信号",
				done() { return player.ne.signals.gte(2750) || player.ne.milestones.includes(0) },
				effectDescription() { return "子空间能量使信号获取乘以 ("+format(player.ss.points.plus(1).sqrt())+"x)，解锁神经网络。" },
			},
			1: {
				requirementDescription: "50,000 信号",
				done() { return player.ne.signals.gte(5e4) || player.ne.milestones.includes(1) },
				effectDescription() { return "思考第一效果平方，神经元里程碑对于第七行重置保留（除了想法）。" },
			},
			2: {
				requirementDescription: "3,000,000 信号",
				done() { return player.ne.signals.gte(3e6) || player.ne.milestones.includes(2) },
				effectDescription() { return "思考需求增长减缓 (5x -> 3x)，思考第二效果平方，神经元加成信号获取翻倍。" },
			},
			3: {
				requirementDescription: "150,000,000 信号",
				done() { return player.ne.signals.gte(1.5e8) || player.ne.milestones.includes(3) },
				effectDescription() { return "思考需求增长减缓 (3x -> 2.5x)，神经元效果使用更好的公式 (用指数代替亚线性)" },
			},
			4: {
				requirementDescription: "2.5e9 信号",
				done() { return player.ne.signals.gte(2.5e9) || player.ne.milestones.includes(4) },
				effectDescription() { return "思考需求增长减缓 (2.5x -> 2x)，获得思考不重置信号。" },
			},
			5: {
				unlocked() { return player.en.unlocked && player.ne.unlocked },
				requirementDescription() { return "8 神经元"+(player.id.unlocked?"":" & 一次重置获得 2,500,000 能量") },
				done() { return (player.ne.best.gte(8) && (player.id.unlocked||player.en.bestOnReset.gte(2.5e6)))||hasAchievement("a", 161) },
				effectDescription() { return "神经元不再重置任何东西，解锁自动神经元和第三思考效果。" },
				toggles: [["ne", "auto"]],
			},
			6: {
				unlocked() { return player.id.unlocked },
				requirementDescription: "1e21 信号",
				done() { return player.ne.signals.gte(1e21) || player.ne.milestones.includes(6) },
				effectDescription() { return "神经元效果平方，并被神经网络等级乘。" },
			},
			7: {
				unlocked() { return hasUpgrade("ai", 11) },
				requirementDescription: "9 神经元",
				done() { return hasUpgrade("ai", 11) && player.ne.best.gte(9) },
				effectDescription: "解锁自动神经网络。",
				toggles: [["ne", "autoNN"]],
			},
		},
		tabFormat: ["main-display",
			"prestige-button",
			"resource-display", "blank", 
			"milestones", "blank", "blank",
			"challenges", "blank",
			"buyables",
			"blank", "blank", "blank",
		],
})
/*
                            
                    dddddddd
  iiii              d::::::d
 i::::i             d::::::d
  iiii              d::::::d
                    d:::::d 
iiiiiii     ddddddddd:::::d 
i:::::i   dd::::::::::::::d 
 i::::i  d::::::::::::::::d 
 i::::i d:::::::ddddd:::::d 
 i::::i d::::::d    d:::::d 
 i::::i d:::::d     d:::::d 
 i::::i d:::::d     d:::::d 
 i::::i d:::::d     d:::::d 
i::::::id::::::ddddd::::::dd
i::::::i d:::::::::::::::::d
i::::::i  d:::::::::ddd::::d
iiiiiiii   ddddddddd   ddddd
                            
                            
                            
                            
                            
                            
                            
*/
addLayer("id", {
		name: "ideas", // This is optional, only used in a few places, If absent it just uses the layer id.
        symbol: "ID", // This appears on the layer's node. Default is the id with the first letter capitalized
        position: 5, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
        startData() { return {
            unlocked: false,
			points: new Decimal(0),
			best: new Decimal(0),
			first: 0,
			auto: false,
        }},
        color: "#fad682",
        requires() { 
			let req = new Decimal(44);
			if (player.ai.unlocked && tmp.ai) req = req.div(tmp.ai.conscEff2);
			return req.max(2);
		}, // Can be a function that takes requirement increases into account
        resource: "想法", // Name of prestige currency
        baseResource: "思考", // Name of resource prestige is based on
        baseAmount() {return player.ne.thoughts}, // Get the current amount of baseResource
		roundUpCost: true,
        type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
        exponent: new Decimal(1.4), // Prestige currency exponent
		base: new Decimal(1.2),
		effect() { return Decimal.sub((hasAchievement("a", 155)?0.005:0)+(hasUpgrade("ai", 32)?0.99:0.95), Decimal.div(0.95, player.id.points.plus(1).log10().times(hasMilestone("id", 4)?1.5:1).times(hasMilestone("id", 5)?1.75:1).plus(1))) },
		effectDescription() { return "减缓思考阈值增加 <h2 style='color: #fad682; text-shadow: #fad682 0px 0px 10px;'>"+format(tmp[this.layer].effect)+"</h2>"+(tmp.nerdMode?" (0.95-0.95/(log(x+1)+1))。":"。") },
		rev() { return player.ne.signals.plus(1).log10().div(10).pow(.75).times(player.id.points).pow(hasMilestone("id", 0)?2:1).times(hasUpgrade("ai", 32)?1.5:1).times(hasUpgrade("ai", 14)?1.5:1).floor() },
		revEff() { return Decimal.pow(1e25, tmp.id.rev.pow(.95)) },
        gainMult() { // Calculate the multiplier for main currency from bonuses
            mult = new Decimal(1)
			if (hasMilestone("id", 2)) mult = mult.div(player.ne.points.plus(1).log10().plus(1));
            return mult
        },
        gainExp() { // Calculate the exponent on main currency from bonuses
            return new Decimal(1)
        },
		canBuyMax() { return hasMilestone("id", 4) && player.id.auto },
        row: 5, // Row the layer is in on the tree (0 is the first row)
        hotkeys: [
            {key: "I", description: "按 Shift+I 进行想法重置", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
        ],
		resetsNothing() { return hasMilestone("id", 4) && player.id.auto },
        doReset(resettingLayer){ 
			let keep = [];
			if (layers[resettingLayer].row<7&&resettingLayer!="ai"&&resettingLayer!="c") {
				keep.push("points");
				keep.push("best");
				keep.push("milestones");
			}
            if (layers[resettingLayer].row > this.row) layerDataReset(this.layer, keep)
			if (hasUpgrade("ai", 22) && !(layers[resettingLayer].row<7&&resettingLayer!="ai"&&resettingLayer!="c")) addPoints("id", 4);
        },
		autoPrestige() { return hasMilestone("id", 4) && player.id.auto },
        layerShown(){return player.en.unlocked&&player.ne.unlocked},
        branches: ["ne"],
		tabFormat: ["main-display",
			"prestige-button",
			"resource-display", "blank", 
			"milestones", "blank", "blank",
			["display-text", function() { return "启示: <h2>"+formatWhole(tmp.id.rev)+"</h2>"+(tmp.nerdMode?(hasMilestone("id", 0)?" ((ideas^2)*(log(signals+1)/10)^1.5)":" (ideas*(log(signals+1)/10)^0.75)"):" (基于想法 & 信号)") }],
			["display-text", function() { return "效果: 机械能量乘以 <h2>"+format(tmp.id.revEff)+"</h2>"+(tmp.nerdMode?" (1e25^(x^0.95))。":"。") } ], "blank",
		],
		milestones: {
			0: {
				requirementDescription: "2 想法 & 2 启示",
				done() { return (player.id.points.gte(2) && tmp.id.rev.gte(2))||hasAchievement("a", 161) },
				effectDescription: "神经网络价格缩放开始延缓 2 购买并且减弱 50%，思考可以批量获取，启示被平方。",
			},
			1: {
				unlocked() { return hasMilestone("id", 0) },
				requirementDescription: "2 想法 & 8 启示",
				done() { return player.id.points.gte(2) && tmp.id.rev.gte(8) },
				effectDescription: "神经元效果平方，思考所有效果增强 20%。",
			},
			2: {
				unlocked() { return hasMilestone("id", 1) },
				requirementDescription: "3 想法 & 22 启示",
				done() { return player.id.points.gte(3) && tmp.id.rev.gte(22) },
				effectDescription() { return "神经元降低想法价格 (/"+format(player.ne.points.plus(1).log10().plus(1))+")。" },
			},
			3: {
				unlocked() { return hasMilestone("id", 2)||hasAchievement("a", 161) },
				requirementDescription: "6 想法 & 245 启示",
				done() { return (player.id.points.gte(6) && tmp.id.rev.gte(245))||hasAchievement("a", 161) },
				effectDescription() { return "解锁自动命令行扩展，比正常购买更高效效，每 OoM 的命令行扩展双倍信号获取（"+format(Decimal.pow(2, player.mc.buyables[11].max(1).log10()))+"x）。" },
				toggles: [["mc", "autoSE"]],
			},
			4: {
				unlocked() { return hasUpgrade("ai", 22)||hasAchievement("a", 164) },
				requirementDescription: "132 启示",
				done() { return ((tmp.id.rev.gte(132)||hasMilestone("id", 4))&&hasUpgrade("ai", 22))||hasAchievement("a", 164) },
				effectDescription: "解锁自动想法，你可以最大购买想法，想法效果增强 50%。",
				toggles: [["id", "auto"]],
			},
			5: {
				unlocked() { return hasUpgrade("ai", 22) },
				requirementDescription: "1,800 启示",
				done() { return (tmp.id.rev.gte(1800)||hasMilestone("id", 5))&&hasUpgrade("ai", 22) },
				effectDescription: "想法效果增强 75%，启示乘以零件和建筑获取。",
			},
		},
})
/*
                    
                    
                    
                    
                    
                    
rrrrr   rrrrrrrrr   
r::::rrr:::::::::r  
r:::::::::::::::::r 
rr::::::rrrrr::::::r
 r:::::r     r:::::r
 r:::::r     rrrrrrr
 r:::::r            
 r:::::r            
 r:::::r            
 r:::::r            
 r:::::r            
 rrrrrrr            
                    
                    
                    
                    
                    
                    
                    
*/
addLayer("r", {
		name: "robots", // This is optional, only used in a few places, If absent it just uses the layer id.
        symbol: "R", // This appears on the layer's node. Default is the id with the first letter capitalized
        position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
        startData() { return {
            unlocked: false,
			points: new Decimal(0),
			best: new Decimal(0),
			total: new Decimal(0),
			allotted: {
				breeders: new Decimal((player && tmp.ma && hasUpgrade("ai", 12))?5:0),
				farmers: new Decimal((player && tmp.ma && hasUpgrade("ai", 12))?5:0),
				builders: new Decimal((player && tmp.ma && hasUpgrade("ai", 12))?5:0),
				growers: new Decimal((player && tmp.ma && hasUpgrade("ai", 12))?5:0),
				producers: new Decimal((player && tmp.ma && hasUpgrade("ai", 12))?5:0),
			},
			maxMinibots: new Decimal(0),
			spentMinibots: new Decimal(0),
			grownMinibots: new Decimal(0),
			fuel: new Decimal(0),
			buildings: new Decimal(1),
			growTime: new Decimal(0),
			deathTime: new Decimal(0),
			first: 0,
        }},
        color: "#00ccff",
		nodeStyle() { return {
			background: (player.r.unlocked||canReset("r"))?((player.grad&&!player.oldStyle)?"radial-gradient(circle, #00ccff 0%, #b0b0b0 75%)":"#b0b0b0"):"#bf8f8f",
		}},
		componentStyles: {
			background() { return (player.r.unlocked||canReset("r"))?((player.grad&&!player.oldStyle)?"radial-gradient(circle, #00ccff 0%, #b0b0b0 75%)":"#b0b0b0"):"#bf8f8f" },
		},
        resource: "机器人", // Name of prestige currency
        type: "custom", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
		baseResource: "总能量",
		baseAmount() { return player.en.total },
		req() { 
			let req = Decimal.root(5e8, player[this.layer].total.plus(1).log10().plus(1).log10().plus(1).log10().plus(1))
			if (player.ai.unlocked && tmp.ai) req = req.div(tmp.ai.conscEff2);
			return req.max(2);
		},
		requires() { return this.req() },
		exp: new Decimal(0.4),
		exponent() { return tmp[this.layer].exp },
		gainMult() {
			let mult = new Decimal(1);
			if (hasMilestone("r", 3)) mult = mult.times(2);
			if (player.ai.unlocked && tmp.ai) mult = mult.times(tmp.ai.conscEff1);
			if (hasUpgrade("ai", 33)) mult = mult.times(upgradeEffect("ai", 33));
			return mult;
		},
		getResetGain() {
			let gain = Decimal.pow(tmp.r.req, player.en.total.plus(1).log(tmp.r.req).pow(tmp.r.exp)).div(tmp.r.req);
			return gain.times(tmp.r.gainMult).floor();
		},
		resetGain() { return this.getResetGain() },
		getNextAt() {
			let gain = tmp.r.getResetGain.div(tmp.r.gainMult).plus(1)
			return Decimal.pow(tmp.r.req, gain.times(tmp.r.req).max(1).log(tmp.r.req).root(tmp.r.exp)).sub(1)
		},
		passiveGeneration() { return false },
		canReset() {
			return player.en.total.gte(tmp.r.req) && tmp.r.getResetGain.gt(0)
		},
		dispGainFormula() {
			let start = tmp.r.req;
			let exp = tmp.r.exp;
			return "("+format(start)+" ^ (log(x+1) / log("+format(tmp.r.req)+") ^ "+format(exp)+")) / "+format(start)
		},
		prestigeButtonText() {
			if (tmp.nerdMode) return "获取公式: "+tmp.r.dispGainFormula;
			else return `${ player.r.points.lt(1e3) ? (tmp.r.resetDescription !== undefined ? tmp.r.resetDescription : "重置获得 ") : ""}+<b>${formatWhole(tmp.r.getResetGain)}</b> ${tmp.r.resource} ${tmp.r.resetGain.lt(100) && player.r.points.lt(1e3) ? `<br><br>下一个在 ${format(tmp.r.nextAt)} 能量` : ""}`
		},
		prestigeNotify() {
			if (!canReset("r")) return false;
			if (tmp.r.getResetGain.gte(player.en.total.times(0.1).max(1)) && !tmp.r.passiveGeneration) return true;
			else return false;
		},
		tooltip() { return formatWhole(player.r.points)+" 机器人" },
		tooltipLocked() { return "达到 "+formatWhole(tmp.r.req)+" 总能量解锁 (你有 "+formatWhole(player.en.total)+" 总能量)" },
        row: 5, // Row the layer is in on the tree (0 is the first row)
        hotkeys: [
            {key: "r", description: "按 R 进行机器人重置", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
        ],
        doReset(resettingLayer){ 
			let keep = [];
			if (layers[resettingLayer].row==5||layers[resettingLayer].row==6) {
				player.r.maxMinibots = new Decimal(0);
				player.r.spentMinibots = new Decimal(0);
				player.r.grownMinibots = new Decimal(0);
				player.r.fuel = new Decimal(0);
				player.r.buildings = new Decimal(1);
				player.r.growTime = new Decimal(0);
				player.r.deathTime = new Decimal(0);
			}
			
			if (layers[resettingLayer].row > this.row+1 || resettingLayer=="ai") layerDataReset(this.layer, keep)
        },
        layerShown(){return player.id.unlocked },
        branches: ["en"],
		update(diff) {
			if (!player[this.layer].unlocked) return;
			player.r.maxMinibots = player.r.maxMinibots.max(tmp.r.totalMinibots);
			player.r.fuel = player.r.fuel.pow(1.5).plus(player.r.allotted.farmers.div(4).times(diff)).root(1.5);
			player.r.buildings = player.r.buildings.pow(2).plus(player.r.allotted.builders.times((hasMilestone("id", 5)&&tmp.id)?tmp.id.rev.max(1):1).div(3).times(diff)).sqrt();
			if (tmp.r.minibots.gt(0)) {
				player.r.deathTime = player.r.deathTime.plus(diff);
				player.r.growTime = player.r.growTime.plus(diff);
			}
			if (Decimal.gte(player.r.deathTime, tmp.r.deathTime)) {
				let bulk = player.r.growTime.div(tmp.r.growTime).min(tmp.r.minibots).floor();
				player.r.deathTime = new Decimal(0);
				if (tmp.r.minibots.gt(0)) {
					player.r.spentMinibots = player.r.spentMinibots.plus(bulk);
				}
			}
			if (Decimal.gte(player.r.growTime, tmp.r.growTime)) {
				let bulk = player.r.growTime.div(tmp.r.growTime).min(tmp.r.minibots).floor();
				player.r.growTime = new Decimal(0);
				if (tmp.r.minibots.gt(0)) {
					addPoints("r", hasUpgrade("ai", 12)?bulk.times(tmp.r.getResetGain.div(20)):bulk);
					player.r.spentMinibots = player.r.spentMinibots.plus(bulk);
					player.r.grownMinibots = player.r.grownMinibots.plus(bulk);
				}
			}
			if (hasMilestone("r", 5)) {
				player.r.allotted.breeders = player.r.allotted.breeders.plus(player.r.points.div(50).times(diff));
				player.r.allotted.farmers = player.r.allotted.farmers.plus(player.r.points.div(50).times(diff));
				player.r.allotted.builders = player.r.allotted.builders.plus(player.r.points.div(50).times(diff));
				player.r.allotted.growers = player.r.allotted.growers.plus(player.r.points.div(50).times(diff));
				player.r.allotted.producers = player.r.allotted.producers.plus(player.r.points.div(50).times(diff));
			}
		},
		tabFormat: ["main-display",
			"prestige-button",
			"resource-display", "blank",
			"milestones",
			"blank", "blank", 
			["clickable", 16], "blank",
			["row", [
				["column", [
					["display-text", function() { return "<h3>"+formatWhole(player.r.allotted.breeders)+"<br>饲养者</h3><br><br><br>" }], "blank",
					["row", [["clickable", 11], ["clickable", 21]]], "blank", "blank",
					["display-text", function() { return "下一个迷你机器人在 "+format(tmp.r.nextMinibot)+" 总能量"+(tmp.nerdMode?"。 (公式: log(EN/1e5 * breeders^"+formatWhole(tmp.r.breederExp)+") ^ (2/3))":"。") }],
				], {width: "9em"}],
				["tall-display-text", "<div class='vl2'></div>", {height: "223.667px"}],
				["column", [
					["display-text", function() { return "<h3>"+formatWhole(player.r.allotted.farmers)+"<br>农民</h3><br>(需要: 1 饲养者)<br><br>" }], "blank",
					["row", [["clickable", 12], ["clickable", 22]]], "blank", "blank",
					["display-text", function() { return "燃料: "+format(player.r.fuel)+"，增强下一个迷你机器人的生命周期到 "+formatTime(tmp.r.deathTime.sub(player.r.deathTime))+"。" }],
				], {width: "9em"}],
				["tall-display-text", "<div class='vl2'></div>", {height: "223.667px"}],
				["column", [
					["display-text", function() { return "<h3>"+formatWhole(player.r.allotted.builders)+"<br>工人</h3><br>(需要: 1 饲养者)<br><br>" }], "blank",
					["row", [["clickable", 13], ["clickable", 23]]], "blank", "blank",
					["display-text", function() { return "建筑: "+formatWhole(player.r.buildings.floor())+"，限制你的迷你机器人为 "+formatWhole(tmp.r.minibotCap)+(tmp.nerdMode?" (公式: log2(x)+3)":"")+" 并使齿轮获取乘以 "+formatWhole(tmp.r.buildingEff)+(tmp.nerdMode?"。 (公式: (x-1)^3*100+1)":"。") }],
				], {width: "9em"}],
				["tall-display-text", "<div class='vl2'></div>", {height: "223.667px"}],
				["column", [
					["display-text", function() { return "<h3>"+formatWhole(player.r.allotted.growers)+"<br>农业专家</h3><br>(需要: 1 饲养者)<br>" }], "blank",
					["row", [["clickable", 14], ["clickable", 24]]], "blank", "blank",
					["display-text", function() { return "下一个迷你机器人在 "+formatTime(tmp.r.growTime.sub(player.r.growTime))+" 内转变为机器人。" }],
				], {width: "9em"}],
				["tall-display-text", "<div class='vl2'></div>", {height: "223.667px"}],
				["column", [
					["display-text", function() { return "<h3>"+formatWhole(player.r.allotted.producers)+"<br>生产者</h3><br><br><br>" }], "blank",
					["row", [["clickable", 15], ["clickable", 25]]], "blank", "blank",
					["display-text", function() { return "能量获取乘以 "+format(tmp.r.producerEff)+(tmp.nerdMode?"。 (公式: ((x^1.5)/4+1))":"。") }],
				], {width: "9em"}],
			], function() { return {display: player.r.unlocked?"":"none"} }], "blank", "blank",
			["display-text", function() { return "你有 <h2 style='color: #00ccff; text-shadow: 0px 0px 7px #00ccff;'>"+formatWhole(tmp.r.minibots)+" / "+formatWhole(tmp.r.minibotCap)+"</h2> 迷你机器人" }],
		],
		breederExp() {
			let exp = new Decimal(3);
			if (hasMilestone("r", 2)) exp = exp.times(2);
			return exp;
		},
		reduceMinibotReqMult() {
			let mult = new Decimal(0);
			if (hasMilestone("r", 3)) mult = mult.plus(.5);
			if (hasUpgrade("ai", 23)) mult = mult.plus(.5);
			return mult;
		},
		nextMinibot() { 
			if (player.r.allotted.breeders.lt(1)||tmp.r.totalMinibots.gte(tmp.r.minibotCap.plus(player.r.spentMinibots))) return new Decimal(1/0);
			else return Decimal.pow(10, tmp.r.totalMinibots.sub(player.r.grownMinibots.times(tmp.r.reduceMinibotReqMult)).plus(1).pow(1.5)).times(1e5).div(player.r.allotted.breeders.max(1).pow(tmp.r.breederExp));
		},
		totalMinibots() { 
			if (player.r.allotted.breeders.lt(1)) return new Decimal(0);
			else return player.en.total.times(player.r.allotted.breeders.pow(tmp.r.breederExp)).div(1e5).max(1).log10().root(1.5).plus(player.r.grownMinibots.times(tmp.r.reduceMinibotReqMult)).floor().min(tmp.r.minibotCap.plus(player.r.spentMinibots))
		},
		minibots() { return player.r.maxMinibots.sub(player.r.spentMinibots).max(0) },
		deathTime() { return player.r.fuel.plus(1).log2().div(3).plus(1).times(20).div(hasUpgrade("ai", 21)?20:1) },
		minibotCap() { return player.r.buildings.floor().max(1).log2().plus(3).floor() },
		buildingEff() { return player.r.buildings.sub(1).max(0).floor().pow(3).times(100).plus(1) },
		growTime() { return player.r.allotted.growers.lt(1)?new Decimal(1/0):Decimal.div(30, player.r.allotted.growers.log10().plus(1)).div(hasUpgrade("ai", 21)?5:1) },
		producerEff() { 
			let mult = hasMilestone("r", 3) ? player.r.grownMinibots.div(4).plus(1) : new Decimal(1);
			if (hasUpgrade("ai", 23)) mult = mult.times(player.r.grownMinibots.times(.4).plus(1));
			return player.r.allotted.producers.pow(1.5).div(4).plus(1).times(mult);
		},
		clickables: {
			rows: 2,
			cols: 6,
			11: {
				title: "+1",
				unlocked() { return player.r.unlocked },
				canClick() { return player.r.unlocked && player.r.points.gt(0) },
				onClick() { 
					player.r.allotted.breeders = player.r.allotted.breeders.plus(1);
					player.r.points = player.r.points.sub(1).max(0);
				},
				style: {width: "50px", height: "50px"},
			},
			12: {
				title: "+1",
				unlocked() { return player.r.unlocked },
				canClick() { return player.r.unlocked && player.r.points.gt(0) && player.r.allotted.breeders.gte(1) },
				onClick() { 
					player.r.allotted.farmers = player.r.allotted.farmers.plus(1);
					player.r.points = player.r.points.sub(1).max(0);
				},
				style: {width: "50px", height: "50px"},
			},
			13: {
				title: "+1",
				unlocked() { return player.r.unlocked },
				canClick() { return player.r.unlocked && player.r.points.gt(0) && player.r.allotted.breeders.gte(1) },
				onClick() { 
					player.r.allotted.builders = player.r.allotted.builders.plus(1);
					player.r.points = player.r.points.sub(1).max(0);
				},
				style: {width: "50px", height: "50px"},
			},
			14: {
				title: "+1",
				unlocked() { return player.r.unlocked },
				canClick() { return player.r.unlocked && player.r.points.gt(0) && player.r.allotted.breeders.gte(1) },
				onClick() { 
					player.r.allotted.growers = player.r.allotted.growers.plus(1);
					player.r.points = player.r.points.sub(1).max(0);
				},
				style: {width: "50px", height: "50px"},
			},
			15: {
				title: "+1",
				unlocked() { return player.r.unlocked },
				canClick() { return player.r.unlocked && player.r.points.gt(0) },
				onClick() { 
					player.r.allotted.producers = player.r.allotted.producers.plus(1);
					player.r.points = player.r.points.sub(1).max(0);
				},
				style: {width: "50px", height: "50px"},
			},
			16: {
				title: "分配",
				unlocked() { return player.r.unlocked },
				canClick() { return player.r.unlocked && player.r.points.gte(5) && player.r.allotted.breeders.gte(1) },
				onClick() { 
					let spendEach = player.r.points.div(5).floor()
					player.r.allotted.breeders = player.r.allotted.breeders.plus(spendEach);
					player.r.allotted.farmers = player.r.allotted.farmers.plus(spendEach);
					player.r.allotted.builders = player.r.allotted.builders.plus(spendEach);
					player.r.allotted.growers = player.r.allotted.growers.plus(spendEach);
					player.r.allotted.producers = player.r.allotted.producers.plus(spendEach);
					player.r.points = player.r.points.sub(spendEach.times(5)).max(0);
				},
				style: {width: "120px", height: "50px"},
			},
			21: {
				title: "50%",
				unlocked() { return player.r.unlocked },
				canClick() { return player.r.unlocked && player.r.points.gte(2) },
				onClick() { 
					let spend = player.r.points.div(2).floor();
					player.r.allotted.breeders = player.r.allotted.breeders.plus(spend);
					player.r.points = player.r.points.sub(spend).max(0);
				},
				style: {width: "50px", height: "50px"},
			},
			22: {
				title: "50%",
				unlocked() { return player.r.unlocked },
				canClick() { return player.r.unlocked && player.r.points.gte(2) && player.r.allotted.breeders.gte(1) },
				onClick() { 
					let spend = player.r.points.div(2).floor();
					player.r.allotted.farmers = player.r.allotted.farmers.plus(spend);
					player.r.points = player.r.points.sub(spend).max(0);
				},
				style: {width: "50px", height: "50px"},
			},
			23: {
				title: "50%",
				unlocked() { return player.r.unlocked },
				canClick() { return player.r.unlocked && player.r.points.gte(2) && player.r.allotted.breeders.gte(1) },
				onClick() { 
					let spend = player.r.points.div(2).floor();
					player.r.allotted.builders = player.r.allotted.builders.plus(spend);
					player.r.points = player.r.points.sub(spend).max(0);
				},
				style: {width: "50px", height: "50px"},
			},
			24: {
				title: "50%",
				unlocked() { return player.r.unlocked },
				canClick() { return player.r.unlocked && player.r.points.gte(2) && player.r.allotted.breeders.gte(1) },
				onClick() { 
					let spend = player.r.points.div(2).floor();
					player.r.allotted.growers = player.r.allotted.growers.plus(spend);
					player.r.points = player.r.points.sub(spend).max(0);
				},
				style: {width: "50px", height: "50px"},
			},
			25: {
				title: "50%",
				unlocked() { return player.r.unlocked },
				canClick() { return player.r.unlocked && player.r.points.gte(2) },
				onClick() { 
					let spend = player.r.points.div(2).floor();
					player.r.allotted.producers = player.r.allotted.producers.plus(spend);
					player.r.points = player.r.points.sub(spend).max(0);
				},
				style: {width: "50px", height: "50px"},
			},
		},
		milestones: {
			0: {
				requirementDescription: "50 总机器人",
				done() { return player.r.total.gte(50) },
				effectDescription: "迷你机器人乘以能量和信号获取。",
			},
			1: {
				requirementDescription: "100 总机器人",
				done() { return player.r.total.gte(100)||hasAchievement("a", 161) },
				effectDescription: "未选择能量依然生成（速度减缓 3x），总机器人乘以能量生成速度。",
			},
			2: {
				requirementDescription: "360 总机器人",
				done() { return player.r.total.gte(360) },
				effectDescription: "有效饲养者平方。",
			},
			3: {
				requirementDescription: "500 总机器人",
				done() { return player.r.total.gte(500) },
				effectDescription: "双倍机器人获取，当迷你机器人转变为机器人时，下一个迷你机器人的需求降低 0.5 等级，生产者效果提高 25%（叠加）。",
			},
			4: {
				unlocked() { return player.id.unlocked||hasAchievement("a", 161) },
				requirementDescription: "2,000 总机器人",
				done() { return player.r.total.gte(2e3)||hasAchievement("a", 161) },
				effectDescription: "三倍机器人获取，生产者效果乘以能量（有很多种的那个能量）生成和信号获取。",
			},
			5: {
				unlocked() { return hasUpgrade("ai", 21) },
				requirementDescription: "4,000,000 总机器人",
				done() { return player.r.total.gte(4e6) && hasUpgrade("ai", 21) },
				effectDescription: "自动分配你 10% 的机器人而并不实际消耗他们。",
			},
		},
})
/*
                          
                          
                    iiii  
                   i::::i 
                    iiii  
                          
  aaaaaaaaaaaaa   iiiiiii 
  a::::::::::::a  i:::::i 
  aaaaaaaaa:::::a  i::::i 
           a::::a  i::::i 
    aaaaaaa:::::a  i::::i 
  aa::::::::::::a  i::::i 
 a::::aaaa::::::a  i::::i 
a::::a    a:::::a  i::::i 
a::::a    a:::::a i::::::i
a:::::aaaa::::::a i::::::i
 a::::::::::aa:::ai::::::i
  aaaaaaaaaa  aaaaiiiiiiii
                          
                          
                          
                          
                          
                          
                          
*/
addLayer("ai", {
		name: "AI", // This is optional, only used in a few places, If absent it just uses the layer id.
        symbol: "AI", // This appears on the layer's node. Default is the id with the first letter capitalized
        position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
        startData() { return {
            unlocked: false,
			points: new Decimal(0),
			best: new Decimal(0),
			total: new Decimal(0),
			first: 0,
			time: new Decimal(0),
			consc: new Decimal(0),
        }},
        color: "#e6ffcc",
		nodeStyle() { return {
			background: (player.ai.unlocked||canReset("ai"))?((player.grad&&!player.oldStyle)?"radial-gradient(circle, #e6ffcc 0%, #566b65 100%)":"#e6ffcc"):"#bf8f8f",
		}},
		componentStyles: {
			"prestige-button": {
				background() { return (canReset("ai"))?((player.grad&&!player.oldStyle)?"radial-gradient(circle, #e6ffcc 0%, #566b65 100%)":"#e6ffcc"):"#bf8f8f" },
			},
		},
        requires: new Decimal(408), // Can be a function that takes requirement increases into account
        resource: "超级智能", // Name of prestige currency 
        baseResource: "启示", // Name of resource prestige is based on
        baseAmount() {return tmp.id.rev}, // Get the current amount of baseResource
        type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
        exponent: new Decimal(2), // Prestige currency exponent
		roundUpCost: true,
        gainMult() { // Calculate the multiplier for main currency from bonuses
            mult = new Decimal(1);
			if (hasUpgrade("ai", 22)) mult = mult.times(3);
			if (hasUpgrade("ai", 41)) mult = mult.times(upgradeEffect("ai", 41));
			if (hasUpgrade("ai", 43)) mult = mult.times(upgradeEffect("ai", 43));
			if (hasUpgrade("ai", 44)) mult = mult.times(player.ai.buyables[11].max(1));
            return mult
        },
        gainExp() { // Calculate the exponent on main currency from bonuses
            return new Decimal(1)
        },
        row: 6, // Row the layer is in on the tree (0 is the first row)
        hotkeys: [
            {key: "R", description: "按 Shift+R 进行 AI 重置。", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
        ],
		passiveGeneration() { return 0 },
        doReset(resettingLayer){ 
			let keep = [];
			if (layers[resettingLayer].row == this.row) {
				player.ai.time = new Decimal(0);
				player.ai.consc = new Decimal(0);
			}
			if (layers[resettingLayer].row > this.row) layerDataReset(this.layer, keep)
        },
        layerShown(){return player.r.unlocked && player.id.unlocked },
        branches: ["r", ["id", 3]],
		update(diff) {
			if (!player[this.layer].unlocked) return;
			player.ai.time = player.ai.time.plus(diff);
			// player.ai.consc = player.ai.consc.plus(tmp.ai.buyables[11].effect.times(diff)).div(Decimal.pow(tmp.ai.divConsc, diff));
			if (tmp.ai.divConsc.lte(1.00001)) player.ai.consc = player.ai.consc.add(tmp.ai.buyables[11].effect.mul(diff));
			else player.ai.consc = player.ai.consc.add(tmp.ai.buyables[11].effect.mul(0.001).sub(player.ai.consc.mul(tmp.ai.divConsc.pow(0.001).sub(1))).mul(tmp.ai.divConsc.pow(0.001).sub(1).recip().mul(Decimal.sub(1, tmp.ai.divConsc.pow(0.001).recip().pow(diff*1000)))))
		},
		divConsc() { return player.ai.time.plus(1).log10().plus(1).sqrt() },
		conscEff1() { return player.ai.consc.plus(1) },
		conscEff2() { return player.ai.consc.plus(1).log(3).plus(1) },
		tabFormat: ["main-display",
			"prestige-button",
			"resource-display", "blank",
			["buyable", 11], "blank",
			["display-text", function() { return "<h3>"+format(player.ai.consc)+"</h3> 人工意识（基于当前第七行重置后时间，每秒除以 "+format(tmp.ai.divConsc)+"）" }], 
			["display-text", function() { return "效果：将能量、信号和机器人获取乘以 "+format(tmp.ai.conscEff1)+(tmp.nerdMode?" (x+1)":"")+"，并将机器人和想法需求除以 "+format(tmp.ai.conscEff2)+(tmp.nerdMode?" (log3(x+1)+1)":".") }],"blank", "blank",
			["clickable", 11],
			["display-text", function() { return "节点："+formatWhole(player.ai.upgrades.length)+" / "+formatWhole(tmp.ai.nodeSlots) }], "blank",
			"upgrades", "blank",
		],
		nodeSlots() { return player.ai.buyables[11].div(2).plus(player.ai.buyables[11].sub(6).div(2).max(0)).plus(player.ai.buyables[11].gte(1)?1:0).floor().min(16).toNumber() },
		upgrades: {
			rows: 4,
			cols: 4,
			11: {
				title: "节点 AA",
				description: "神经网络增强 50%，解锁新的神经元里程碑。",
				multiRes: [
					{
						cost: new Decimal(2),
					},
					{
						currencyDisplayName: "人工意识",
						currencyInternalName: "consc",
						currencyLayer: "ai",
						cost: new Decimal(5),
					},
				],
				canAfford() {
					let a = canAffordUpgrade(this.layer, this.id, true);
					return a && (player.ai.upgrades.length<tmp.ai.nodeSlots)
				},
				unlocked() { return player.ai.unlocked },
				style: {height: '150px', width: '150px'},
			},
			12: {
				title: "节点 AB",
				description: "每个转化为机器人的迷你机器人加成机器人获取 5%，起始时每个专业机器人有 5 个。",
				multiRes: [
					{
						cost: new Decimal(10),
					},
					{
						currencyDisplayName: "人工意识",
						currencyInternalName: "consc",
						currencyLayer: "ai",
						cost: new Decimal(180),
					},
				],
				canAfford() {
					let a = canAffordUpgrade(this.layer, this.id, true);
					return a && (player.ai.upgrades.length<tmp.ai.nodeSlots)
				},
				unlocked() { return player.ai.unlocked && hasUpgrade("ai", 11) },
				style: {height: '150px', width: '150px'},
			},
			13: {
				title: "节点 AC",
				description: "齿轮进化变强 50%，解锁一个新的齿轮里程碑。",
				multiRes: [
					{
						cost: new Decimal(300),
					},
					{
						currencyDisplayName: "人工意识",
						currencyInternalName: "consc",
						currencyLayer: "ai",
						cost: new Decimal(48e3),
					},
				],
				canAfford() {
					let a = canAffordUpgrade(this.layer, this.id, true);
					return a && (player.ai.upgrades.length<tmp.ai.nodeSlots)
				},
				unlocked() { return player.ai.unlocked && player.ai.upgrades.length>=4 },
				style: {height: '150px', width: '150px'},
			},
			14: {
				title: "Node AD",
				description: "启示获取提高 50%，齿轮进化效果增强 11.1%。",
				multiRes: [
					{
						cost: new Decimal(5e3),
					},
					{
						currencyDisplayName: "人工意识",
						currencyInternalName: "consc",
						currencyLayer: "ai",
						cost: new Decimal(5e8),
					},
				],
				canAfford() {
					let a = canAffordUpgrade(this.layer, this.id, true);
					return a && (player.ai.upgrades.length<tmp.ai.nodeSlots)
				},
				unlocked() { return player.ai.unlocked && player.ai.upgrades.length>=9 },
				style: {height: '150px', width: '150px'},
			},
			21: {
				title: "节点 BA",
				description: "迷你机器人生长加快 5 倍，解锁一个新的机器人里程碑，但迷你机器人死亡变快 20 倍。",
				multiRes: [
					{
						cost: new Decimal(15),
					},
					{
						currencyDisplayName: "人工意识",
						currencyInternalName: "consc",
						currencyLayer: "ai",
						cost: new Decimal(190),
					},
				],
				canAfford() {
					let a = canAffordUpgrade(this.layer, this.id, true);
					return a && (player.ai.upgrades.length<tmp.ai.nodeSlots)
				},
				unlocked() { return player.ai.unlocked && hasUpgrade("ai", 11) },
				style: {height: '150px', width: '150px'},
			},
			22: {
				title: "节点 BB",
				description: "三倍超级智能获取，起始时拥有 4 想法，解锁两个新的想法里程碑。",
				multiRes: [
					{
						cost: new Decimal(50),
					},
					{
						currencyDisplayName: "人工意识",
						currencyInternalName: "consc",
						currencyLayer: "ai",
						cost: new Decimal(2e3),
					},
				],
				canAfford() {
					let a = canAffordUpgrade(this.layer, this.id, true);
					return a && (player.ai.upgrades.length<tmp.ai.nodeSlots)
				},
				unlocked() { return player.ai.unlocked && hasUpgrade("ai", 11) },
				style: {height: '150px', width: '150px'},
			},
			23: {
				title: "节点 BC",
				description: "当迷你机器人变为机器人时，下一个迷你机器人的需求降低 0.5 级，生产者效果增强 40%（叠加）。",
				multiRes: [
					{
						cost: new Decimal(500),
					},
					{
						currencyDisplayName: "人工意识",
						currencyInternalName: "consc",
						currencyLayer: "ai",
						cost: new Decimal(196000),
					},
				],
				canAfford() {
					let a = canAffordUpgrade(this.layer, this.id, true);
					return a && (player.ai.upgrades.length<tmp.ai.nodeSlots)
				},
				unlocked() { return player.ai.unlocked && player.ai.upgrades.length>=4 },
				style: {height: '150px', width: '150px'},
			},
			24: {
				title: "节点 BD",
				description: "齿轮加成星云获取。",
				multiRes: [
					{
						cost: new Decimal(2e4),
					},
					{
						currencyDisplayName: "人工意识",
						currencyInternalName: "consc",
						currencyLayer: "ai",
						cost: new Decimal(2e9),
					},
				],
				canAfford() {
					let a = canAffordUpgrade(this.layer, this.id, true);
					return a && (player.ai.upgrades.length<tmp.ai.nodeSlots)
				},
				unlocked() { return player.ai.unlocked && player.ai.upgrades.length>=9 },
				style: {height: '150px', width: '150px'},
				effect() { return player.ge.points.max(1).pow(5) },
				effectDisplay() { return format(tmp.ai.upgrades[24].effect)+"x" },
				formula: "x^5",
			},
			31: {
				title: "节点 CA",
				description: "机械能量损失减半，解锁一个新的机械里程碑。",
				multiRes: [
					{
						cost: new Decimal(300),
					},
					{
						currencyDisplayName: "人工意识",
						currencyInternalName: "consc",
						currencyLayer: "ai",
						cost: new Decimal(48e3),
					},
				],
				canAfford() {
					let a = canAffordUpgrade(this.layer, this.id, true);
					return a && (player.ai.upgrades.length<tmp.ai.nodeSlots)
				},
				unlocked() { return player.ai.unlocked && player.ai.upgrades.length>=4 },
				style: {height: '150px', width: '150px'},
			},
			32: {
				title: "节点 CB",
				description: "想法效果增加 0.04，启示获取加成 50%。",
				multiRes: [
					{
						cost: new Decimal(500),
					},
					{
						currencyDisplayName: "人工意识",
						currencyInternalName: "consc",
						currencyLayer: "ai",
						cost: new Decimal(196000),
					},
				],
				canAfford() {
					let a = canAffordUpgrade(this.layer, this.id, true);
					return a && (player.ai.upgrades.length<tmp.ai.nodeSlots)
				},
				unlocked() { return player.ai.unlocked && player.ai.upgrades.length>=4 },
				style: {height: '150px', width: '150px'},
			},
			33: {
				title: "节点 CC",
				description: "超级智能加成齿轮、组件和机器人获取，命令行扩展对机械能量获取加成提升至 100 次幂。",
				multiRes: [
					{
						cost: new Decimal(1500),
					},
					{
						currencyDisplayName: "人工意识",
						currencyInternalName: "consc",
						currencyLayer: "ai",
						cost: new Decimal(790000),
					},
				],
				canAfford() {
					let a = canAffordUpgrade(this.layer, this.id, true);
					return a && (player.ai.upgrades.length<tmp.ai.nodeSlots)
				},
				unlocked() { return player.ai.unlocked && player.ai.upgrades.length>=4 },
				style: {height: '150px', width: '150px'},
				effect() { return player.ai.points.plus(1).pow(1.5) },
				effectDisplay() { return format(tmp.ai.upgrades[33].effect)+"x" },
				formula: "(x+1)^1.5",
			},
			34: {
				title: "节点 CD",
				description: "超级能量，思维能量，齿轮获取提高到 1.2 次幂。",
				multiRes: [
					{
						cost: new Decimal(5e4),
					},
					{
						currencyDisplayName: "人工意识",
						currencyInternalName: "consc",
						currencyLayer: "ai",
						cost: new Decimal(1e10),
					},
				],
				canAfford() {
					let a = canAffordUpgrade(this.layer, this.id, true);
					return a && (player.ai.upgrades.length<tmp.ai.nodeSlots)
				},
				unlocked() { return player.ai.unlocked && player.ai.upgrades.length>=9 },
				style: {height: '150px', width: '150px'},
			},
			41: {
				title: "节点 DA",
				description: "专精加成超级能量获取。",
				multiRes: [
					{
						cost: new Decimal(5e3),
					},
					{
						currencyDisplayName: "人工意识",
						currencyInternalName: "consc",
						currencyLayer: "ai",
						cost: new Decimal(5e8),
					},
				],
				canAfford() {
					let a = canAffordUpgrade(this.layer, this.id, true);
					return a && (player.ai.upgrades.length<tmp.ai.nodeSlots)
				},
				unlocked() { return player.ai.unlocked && player.ai.upgrades.length>=9 },
				style: {height: '150px', width: '150px'},
				effect() { return Decimal.pow(1.05, player.ma.points) },
				effectDisplay() { return format(tmp.ai.upgrades[41].effect)+"x" },
				formula: "1.05^x",
			},
			42: {
				title: "节点 DB",
				description: "每个激活的 AI 节点将信号获取乘以 100。",
				multiRes: [
					{
						cost: new Decimal(2e4),
					},
					{
						currencyDisplayName: "人工意识",
						currencyInternalName: "consc",
						currencyLayer: "ai",
						cost: new Decimal(2e9),
					},
				],
				canAfford() {
					let a = canAffordUpgrade(this.layer, this.id, true);
					return a && (player.ai.upgrades.length<tmp.ai.nodeSlots)
				},
				unlocked() { return player.ai.unlocked && player.ai.upgrades.length>=9 },
				style: {height: '150px', width: '150px'},
				effect() { return Decimal.pow(100, player.ai.upgrades.length) },
				effectDisplay() { return format(tmp.ai.upgrades[42].effect)+"x" },
				formula: "100^x",
			},
			43: {
				title: "节点 DC",
				description: "想法增幅超级能量获取。",
				multiRes: [
					{
						cost: new Decimal(5e4),
					},
					{
						currencyDisplayName: "人工意识",
						currencyInternalName: "consc",
						currencyLayer: "ai",
						cost: new Decimal(1e10),
					},
				],
				canAfford() {
					let a = canAffordUpgrade(this.layer, this.id, true);
					return a && (player.ai.upgrades.length<tmp.ai.nodeSlots)
				},
				unlocked() { return player.ai.unlocked && player.ai.upgrades.length>=9 },
				style: {height: '150px', width: '150px'},
				effect() { return Decimal.pow(1.075, player.id.points) },
				effectDisplay() { return format(tmp.ai.upgrades[43].effect)+"x" },
				formula: "1.075^x",
			},
			44: {
				title: "节点 DD",
				description: "人工意识增幅齿轮获取，AI 网络乘以超级智能获取。",
				multiRes: [
					{
						cost: new Decimal(1e6),
					},
					{
						currencyDisplayName: "人工意识",
						currencyInternalName: "consc",
						currencyLayer: "ai",
						cost: new Decimal(5e11),
					},
				],
				canAfford() {
					let a = canAffordUpgrade(this.layer, this.id, true);
					return a && (player.ai.upgrades.length<tmp.ai.nodeSlots)
				},
				unlocked() { return player.ai.unlocked && player.ai.upgrades.length>=9 },
				style: {height: '150px', width: '150px'},
				effect() { return player.ai.consc.plus(1).pow(5) },
				effectDisplay() { return format(tmp.ai.upgrades[44].effect)+"x" },
				formula: "x^5",
			},
		},
		buyables: {
			rows: 1,
			cols: 1,
			11: {
				title: "AI 网络",
				cost(x=player[this.layer].buyables[this.id]) {
					return {
						ai: Decimal.pow(2, x),
						ge: Decimal.pow(100, x.pow(1.8)).times(1e78),
						mc: Decimal.pow('1e525', x.pow(2.5)).times('1e750'),
					};
				},
				effect() { return Decimal.pow(4, player[this.layer].buyables[this.id]).sub(1).times(hasAchievement("a", 163)?player.id.points.max(1):1) },
				display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id];
					let cost = data.cost;
					let amt = player[this.layer].buyables[this.id];
                    let display = formatWhole(player.ai.points)+" / "+formatWhole(cost.ai)+" 超级智能"+(tmp.nerdMode?(" (2^x)"):"")+"<br>"+formatWhole(player.ge.points)+" / "+formatWhole(cost.ge)+" 齿轮"+(tmp.nerdMode?(" (100^(x^1.8)*1e78)"):"")+"<br>"+formatWhole(player.mc.mechEn.times(tmp.mc.mechEnMult))+" / "+formatWhole(cost.mc)+" 机械能量"+(tmp.nerdMode?(" (1e525^(x^2.5)*1e750)"):"")+"<br><br>等级: "+formatWhole(amt)+"<br><br>奖励: 每秒产生 "+formatWhole(data.effect)+" 人工意识"+(tmp.nerdMode?" (4^x-1)":".");
					return display;
                },
                unlocked() { return unl(this.layer) }, 
                canAfford() {
					if (!tmp[this.layer].buyables[this.id].unlocked) return false;
					let cost = layers[this.layer].buyables[this.id].cost();
                    return player[this.layer].unlocked && player.ai.points.gte(cost.ai) && player.ge.points.gte(cost.ge) && player.mc.mechEn.times(tmp.mc.mechEnMult).gte(cost.mc) && player.ai.time>=1;
				},
                buy() { 
					let cost = tmp[this.layer].buyables[this.id].cost;
					player.ai.points = player.ai.points.sub(cost.ai);
					player.ge.points = player.ge.points.sub(cost.ge);
					player.mc.points = player.mc.points.sub(cost.mc);
					player.ai.buyables[this.id] = player.ai.buyables[this.id].plus(1);
                },
                style: {'height':'200px', 'width':'200px'},
				autoed() { return false },
			},
		},
		clickables: {
			rows: 1,
			cols: 1,
			11: {
				title: "删除所有 AI 节点",
				display: "",
				unlocked() { return player.ai.unlocked },
				canClick() { return player.ai.unlocked && player.ai.upgrades.length>0 },
				onClick() { 
					if (!confirm("你确定要删除所有节点吗？会强制进行一次 AI 重置！")) return;
					player.ai.upgrades = [];
					doReset("ai", true);
				},
				style: {width: "80px", height: "80px"},
			},
		},
})
/*
                    
                    
                    
                    
                    
                    
    cccccccccccccccc
  cc:::::::::::::::c
 c:::::::::::::::::c
c:::::::cccccc:::::c
c::::::c     ccccccc
c:::::c             
c:::::c             
c::::::c     ccccccc
c:::::::cccccc:::::c
 c:::::::::::::::::c
  cc:::::::::::::::c
    cccccccccccccccc
                    
                    
                    
                    
                    
                    
                    
*/
addLayer("c", {
		name: "civilizations", // This is optional, only used in a few places, If absent it just uses the layer id.
        symbol: "C", // This appears on the layer's node. Default is the id with the first letter capitalized
        position: 4, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
        startData() { return {
            unlocked: false,
			points: new Decimal(0),
			assigned: [new Decimal(0), new Decimal(0), new Decimal(0), new Decimal(0), new Decimal(0)],
			gainedPower: [new Decimal(0), new Decimal(0), new Decimal(0), new Decimal(0), new Decimal(0)],
			first: 0,
        }},
        color: "#edb3ff",
        requires() { return Decimal.sub(108, hasAchievement("a", 164)?player.c.buyables[11].times(2):0).max(8) }, // Can be a function that takes requirement increases into account
        resource: "文明力量", // Name of prestige currency
        baseResource: "砖石", // Name of resource prestige is based on
        baseAmount() {return player.i.points}, // Get the current amount of baseResource
		roundUpCost: true,
        type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
        exponent: new Decimal(1.2), // Prestige currency exponent
		base: new Decimal(1.025),
        gainMult() { // Calculate the multiplier for main currency from bonuses
            mult = new Decimal(1)
            return mult
        },
        gainExp() { // Calculate the exponent on main currency from bonuses
            return new Decimal(1)
        },
		canBuyMax() { return false },
        row: 6, // Row the layer is in on the tree (0 is the first row)
        hotkeys: [
            {key: "C", description: "按 Shift+C 进行文明重置。", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
        ],
		resetsNothing() { return false },
        doReset(resettingLayer){ 
			let keep = [];
            if (layers[resettingLayer].row > this.row) layerDataReset(this.layer, keep)
        },
		autoPrestige() { return false },
        layerShown(){return player.ai.unlocked},
        branches: [["i", 2], "id"],
		update(diff) {
			if (!player.c.unlocked) return;
			for (let i=0;i<5;i++) player.c.gainedPower[i] = Decimal.pow(2, player.c.gainedPower[i]).pow(3).plus(Decimal.pow(2, player.c.assigned[i]).sub(1).max(0).times(diff/100)).cbrt().log2();
		},
		power() {
			let data = [];
			for (let i=1;i<=5;i++) data[i] = player.c.points.sub(i).div(5).plus(1).floor().max(0).sqrt().plus(player.c.gainedPower[i-1]);
			return data;
		},
		totalAssigned() { return player.c.assigned.reduce((a,c) => Decimal.add(a, c)) },
		minAssigned() { return player.c.assigned.reduce((a,c) => Decimal.min(a, c)) },
		eff1() { return tmp.c.power[1].times(50) },
		eff2() { return Decimal.pow(1e20, tmp.c.power[2]) },
		eff3() { return Decimal.pow(1e15, tmp.c.power[3]) },
		eff4() { return Decimal.pow("1e1000", tmp.c.power[4]) },
		eff5() { return tmp.c.power[5].plus(1).log(4).plus(1) },
		tabFormat: ["main-display",
			"prestige-button",
			"resource-display", "blank",
			["row", [
				["column", [
					["display-text", "<h3>文明<sub>1</sub></h3>"],
					["display-text", function() { return (player.c.assigned[0].gt(0)?("人口: "+formatWhole(player.c.assigned[0])+"<br>"):"")+"力量: "+format(tmp.c.power[1].times(100))+"%" }], "blank",
					["display-text", function() { return "效果: +"+format(tmp.c.eff1.times(100))+"% 超建筑增益" }],
					"blank", ["clickable", 11],
				], function() { return {width: "9em", visibility: player.c.points.gte(1)?"visible":"hidden"}}],
				["tall-display-text", "<div class='vl2'></div>", function() { return {height: "223.667px", visibility: player.c.points.gte(2)?"visible":"hidden"}}],
				["column", [
					["display-text", "<h3>文明<sub>2</sub></h3>"],
					["display-text", function() { return (player.c.assigned[1].gt(0)?("人口: "+formatWhole(player.c.assigned[1])+"<br>"):"")+"力量: "+format(tmp.c.power[2].times(100))+"%" }], "blank",
					["display-text", function() { return "效果: 将思考需求除以 "+format(tmp.c.eff2) }],
					"blank", ["clickable", 12],
				], function() { return {width: "9em", visibility: player.c.points.gte(2)?"visible":"hidden"}}],
				["tall-display-text", "<div class='vl2'></div>", function() { return {height: "223.667px", visibility: player.c.points.gte(3)?"visible":"hidden"}}],
				["column", [
					["display-text", "<h3>文明<sub>3</sub></h3>"],
					["display-text", function() { return (player.c.assigned[2].gt(0)?("人口: "+formatWhole(player.c.assigned[2])+"<br>"):"")+"力量: "+format(tmp.c.power[3].times(100))+"%" }], "blank",
					["display-text", function() { return "效果: 将信号获取乘以 "+format(tmp.c.eff3) }],
					"blank", ["clickable", 13],
				], function() { return {width: "9em", visibility: player.c.points.gte(3)?"visible":"hidden"}}],
				["tall-display-text", "<div class='vl2'></div>", function() { return {height: "223.667px", visibility: player.c.points.gte(4)?"visible":"hidden"}}],
				["column", [
					["display-text", "<h3>文明<sub>4</sub></h3>"],
					["display-text", function() { return (player.c.assigned[3].gt(0)?("人口: "+formatWhole(player.c.assigned[3])+"<br>"):"")+"力量: "+format(tmp.c.power[4].times(100))+"%" }], "blank",
					["display-text", function() { return "效果: 恶魂和机械能量获取乘以 "+format(tmp.c.eff4) }],
					"blank", ["clickable", 14],
				], function() { return {width: "9em", visibility: player.c.points.gte(4)?"visible":"hidden"}}],
				["tall-display-text", "<div class='vl2'></div>", function() { return {height: "223.667px", visibility: player.c.points.gte(5)?"visible":"hidden"}}],
				["column", [
					["display-text", "<h3>文明<sub>5</sub></h3>"],
					["display-text", function() { return (player.c.assigned[4].gt(0)?("人口: "+formatWhole(player.c.assigned[4])+"<br>"):"")+"力量: "+format(tmp.c.power[5].times(100))+"%" }], "blank",
					["display-text", function() { return "效果: 超级增幅器和神经网络增强 "+format(tmp.c.eff5.sub(1).times(100))+"%" }],
					"blank", ["clickable", 15],
				], function() { return {width: "9em", visibility: player.c.points.gte(5)?"visible":"hidden"}}],
			], function() { return {visibility: player.c.unlocked?"visible":"hidden"} }], "blank", "blank",
			"buyables",
		],
		buyables: {
			showRespec() { return player.c.points.gte(6) },
            respec() {
                player[this.layer].points = player[this.layer].points.add(player[this.layer].spentOnBuyables);
				player.c.assigned = [new Decimal(0), new Decimal(0), new Decimal(0), new Decimal(0), new Decimal(0)];
				player.c.gainedPower = [new Decimal(0), new Decimal(0), new Decimal(0), new Decimal(0), new Decimal(0)];
                doReset(this.layer, true);
            },
			respecText: "重置人口",
			rows: 1,
			cols: 1,
			11: {
				title: "人口",
				cost(x=player[this.layer].buyables[this.id]) {
					return Decimal.pow(1.5, x.pow(1.1)).times(4e5).round();
				},
				cap() { 
					let cap = player.c.points.sub(4).max(0);
					cap = cap.plus(player.c.points.div(5).sub(1).max(0).floor().times(2));
					cap = cap.plus(player.c.points.div(12).max(0).floor());
					return cap;
				},
				display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id];
					let cost = data.cost;
					let amt = player[this.layer].buyables[this.id];
                    let display = formatWhole(player.ai.points)+" / "+formatWhole(cost)+" 超级智能"+(tmp.nerdMode?(" (1.5^(x^1.1))*400,000"):"")+"<br><br>人口: "+formatWhole(amt)+" / "+formatWhole(data.cap);
					return display;
                },
                unlocked() { return unl(this.layer) && player.c.points.gte(6) }, 
                canAfford() {
					if (!tmp[this.layer].buyables[this.id].unlocked) return false;
					let cost = layers[this.layer].buyables[this.id].cost();
                    return player[this.layer].unlocked && player.ai.points.gte(cost) && player.c.buyables[this.id].lt(tmp[this.layer].buyables[this.id].cap);
				},
                buy() { 
					let cost = tmp[this.layer].buyables[this.id].cost;
					player.ai.points = player.ai.points.sub(cost);
					player.c.buyables[this.id] = player.c.buyables[this.id].plus(1);
                },
                style: {'height':'140px', 'width':'140px'},
				autoed() { return false },
			},
		},
		clickables: {
			rows: 1,
			cols: 5,
			11: {
				title: "+1 人口",
				display: "",
				unlocked() { return player.c.unlocked && player.c.points.gte(6) },
				canClick() { return player.c.unlocked && player.c.points.gte(6) && layers.c.totalAssigned().lt(player.c.buyables[11]) && layers.c.minAssigned().eq(player.c.assigned[0]) },
				onClick() { 
					player.c.assigned[0] = player.c.assigned[0].plus(1);
				},
				style: {width: "120px", height: "50px", "border-radius": "0px"},
			},
			12: {
				title: "+1 人口",
				display: "",
				unlocked() { return player.c.unlocked && player.c.points.gte(6) },
				canClick() { return player.c.unlocked && player.c.points.gte(6) && layers.c.totalAssigned().lt(player.c.buyables[11]) && layers.c.minAssigned().eq(player.c.assigned[1]) },
				onClick() { 
					player.c.assigned[1] = player.c.assigned[1].plus(1);
				},
				style: {width: "120px", height: "50px", "border-radius": "0px"},
			},
			13: {
				title: "+1 人口",
				display: "",
				unlocked() { return player.c.unlocked && player.c.points.gte(6) },
				canClick() { return player.c.unlocked && player.c.points.gte(6) && layers.c.totalAssigned().lt(player.c.buyables[11]) && layers.c.minAssigned().eq(player.c.assigned[2]) },
				onClick() { 
					player.c.assigned[2] = player.c.assigned[2].plus(1);
				},
				style: {width: "120px", height: "50px", "border-radius": "0px"},
			},
			14: {
				title: "+1 人口",
				display: "",
				unlocked() { return player.c.unlocked && player.c.points.gte(6) },
				canClick() { return player.c.unlocked && player.c.points.gte(6) && layers.c.totalAssigned().lt(player.c.buyables[11]) && layers.c.minAssigned().eq(player.c.assigned[3]) },
				onClick() { 
					player.c.assigned[3] = player.c.assigned[3].plus(1);
				},
				style: {width: "120px", height: "50px", "border-radius": "0px"},
			},
			15: {
				title: "+1 人口",
				display: "",
				unlocked() { return player.c.unlocked && player.c.points.gte(6) },
				canClick() { return player.c.unlocked && player.c.points.gte(6) && layers.c.totalAssigned().lt(player.c.buyables[11]) && layers.c.minAssigned().eq(player.c.assigned[4]) },
				onClick() { 
					player.c.assigned[4] = player.c.assigned[4].plus(1);
				},
				style: {width: "120px", height: "50px", "border-radius": "0px"},
			},
		},
})
/*
                  
                  
                  
                  
                  
                  
  aaaaaaaaaaaaa   
  a::::::::::::a  
  aaaaaaaaa:::::a 
           a::::a 
    aaaaaaa:::::a 
  aa::::::::::::a 
 a::::aaaa::::::a 
a::::a    a:::::a 
a::::a    a:::::a 
a:::::aaaa::::::a 
 a::::::::::aa:::a
  aaaaaaaaaa  aaaa
                  
                  
                  
                  
                  
                  
                  
*/
addLayer("a", {
        startData() { return {
            unlocked: true,
        }},
        color: "yellow",
        row: "side",
        layerShown() {return true}, 
        tooltip() { // Optional, tooltip displays when the layer is locked
            return ("成就")
        },
        achievements: {
            rows: 16,
            cols: 5,
            11: {
                name: "进展开始！",
                done() { return player.p.points.gt(0) },
                tooltip: "进行一次声望重置。",
				image: "images/achs/11.png",
            },
			12: {
				name: "点数鼹鼠",
				done() { return player.points.gte(25) },
				tooltip: "达到 25 点数。",
				image: "images/achs/12.png",
			},
			13: {
				name: "一直声望",
				done() { return player.p.upgrades.length>=3 },
				tooltip: "购买 3 个声望升级。\n奖励: 声望获取增加 10%。",
				image: "images/achs/13.png",
			},
			14: {
				name: "声望^2",
				done() { return player.p.points.gte(25) },
				tooltip: "达到 25 声望。",
				image: "images/achs/14.png",
			},
			15: {
				name: "第一终端",
				unlocked() { return hasAchievement("a", 111) },
				done() { return player.ma.mastered.includes("p") },
				tooltip: "镀金声望。",
				image: "images/achs/15.png",
			},
			21: {
				name: "新的行在召唤！",
				done() { return player.b.unlocked||player.g.unlocked },
				tooltip: "进行一次第二行的重置。\n奖励: 点数生成速度加快 10%，解锁 3 个新的声望升级。",
				image: "images/achs/21.png",
			},
			22: {
				name: "我终将获得所有的层！",
				done() { return player.b.unlocked&&player.g.unlocked },
				tooltip: "解锁 增幅器 & 生成器。",
				image: "images/achs/22.png",
			},
			23: {
				name: "声望^3",
				done() { return player.p.points.gte(1e45) },
				tooltip: "达到 1e45 声望。\n奖励: 解锁 3 个新的声望升级。",
				image: "images/achs/23.png",
			},
			24: {
				name: "喂？我还没拥有那家公司！",
				done() { return player.points.gte(1e100) },
				tooltip: "达到 1e100 点数。",
				image: "images/achs/24.png",
			},
			25: {
				name: "第二终端",
				unlocked() { return hasAchievement("a", 111) },
				done() { return player.ma.mastered.includes("b")&&player.ma.mastered.includes("g") },
				tooltip: "镀金增幅器和生成器。",
				image: "images/achs/25.png",
			},
			31: {
				name: "深深深入",
				done() { return player.e.unlocked||player.t.unlocked||player.s.unlocked },
				tooltip: "进行一次第三行的重置。奖励: 点数生成速度加快 50%，并且增幅器和生成器不再提高对方的需求。",
				image: "images/achs/31.png",
			},
			32: {
				name: "为啥没有元层？",
				done() { return player.points.gte(Number.MAX_VALUE) },
				tooltip: "达到 1.8e308 点数。\n奖励: 双倍声望获取。",
				image: "images/achs/32.png",
			},
			33: {
				name: "那很快",
				done() { return player.e.unlocked&&player.t.unlocked&&player.s.unlocked },
				tooltip: "解锁时间、增强和空间。\n奖励: 解锁新的时间、增强和空间升级。",
				image: "images/achs/33.png",
			},
			34: {
				name: "有谁会一直需要第二行？",
				done() { return player.b.best.eq(0) && player.g.best.eq(0) && player.points.gte("1e525") },
				tooltip: "不使用增幅器和生成器的情况下到达 1e525 点数。",
				image: "images/achs/34.png",
			},
			35: {
				name: "工具增强速度",
				unlocked() { return hasAchievement("a", 111) },
				done() { return player.ma.mastered.includes("t")&&player.ma.mastered.includes("e")&&player.ma.mastered.includes("s") },
				tooltip: "镀金时间、增强和空间。",
				image: "images/achs/35.png",
			},
			41: {
				name: "超级超级",
				done() { return player.sb.unlocked },
				tooltip: "解锁超级增幅器。\n奖励: 声望升级永远保留，解锁 3 个新的增幅器升级。",
				image: "images/achs/41.png",
			},
			42: {
				name: "另一个- [版权]",
				done() { return player.g.power.gte(Number.MAX_VALUE) },
				tooltip: "达到 1.8e308 GP。",
				image: "images/achs/42.png",
			},
			43: {
				name: "增强一家公司",
				done() { return player.e.points.gte(1e100) },
				tooltip: "达到 1e100 增强。",
				image: "images/achs/43.png",
			},
			44: {
				name: "空间留给怪胎",
				done() { return tmp.s.manualBuildingLevels.eq(0) && player.g.power.gte("1e370") },
				tooltip: "不使用建筑的情况下达到 1e370 GP。",
				image: "images/achs/44.png",
			},
			45: {
				name: "超精密",
				unlocked() { return hasAchievement("a", 111) },
				done() { return player.ma.mastered.includes("sb")&&player.ma.mastered.includes("sg") },
				tooltip: "镀金超级增幅器和超级生成器。",
				image: "images/achs/45.png",
			},
			51: {
				name: "又一行",
				done() { return player.h.unlocked||player.q.unlocked },
				tooltip: "进行一次第四行重置。\n奖励: 时间/增强/空间 不再提高对方的需求。",
				image: "images/achs/51.png",
			},
			52: {
				name: "障碍正在路上",
				done() { return inChallenge("h", 11) && player.points.gte("1e7250") },
				tooltip: '在 "升级荒漠" 中达到 e7,250 点数。',
				image: "images/achs/52.png",
			},
			53: {
				name: "已经？？？？",
				done() { return player.sg.unlocked },
				tooltip: "进行一次超级生成器重置。\n奖励: 获得两个额外空间。",
				image: "images/achs/53.png",
			},
			54: {
				name: "无敌 bug",
				done() { return player.sg.best.eq(0) && player.sb.best.eq(0) && player.points.gte("1e15500") },
				tooltip: "不使用超级增幅器和超级生成器的情况下达到 1e15,500 点数。",
				image: "images/achs/54.png",
			},
			55: {
				name: "邪恶的 HQ",
				unlocked() { return hasAchievement("a", 111) },
				done() { return player.ma.mastered.includes("q")&&player.ma.mastered.includes("h") },
				tooltip: "镀金诡异和障碍。",
				image: "images/achs/55.png",
			},
			61: {
				name: "SS",
				done() { return player.ss.unlocked || player.o.unlocked },
				tooltip: "进行一次阳光重置或一次子空间重置",
				image: "images/achs/61.png",
			},
			62: {
				name: "全抓走",
				done() { return player.ss.unlocked && player.o.unlocked },
				tooltip: "进行一次太阳重置和子空间重置。\n奖励: 太阳和子空间以首先选择其的方式运行。",
				image: "images/achs/62.png",
			},
			63: {
				name: "广袤",
				done() { return inChallenge("h", 21) && player.g.best.eq(0) && player.points.gte("1e25000") },
				tooltip: '在 "空间紧缺" 中不使用任何生成器达到 1e25,000 点数。',
				image: "images/achs/63.png",
			},
			64: {
				name: "永恒^2",
				done() { return player.h.challenges[31]>=10 },
				tooltip: '完成 10 次 "永恒"。\n奖励: 永远保留第 2/3 行的升级。',
				image: "images/achs/64.png",
			},
			65: {
				name: "血月",
				unlocked() { return hasAchievement("a", 111) },
				done() { return player.ma.mastered.includes("o")&&player.ma.mastered.includes("ss") },
				tooltip: "镀金阳光和子空间。",
				image: "images/achs/65.png",
			},
			71: {
				name: "另一个咬铁锈的",
				done() { return player.m.unlocked || player.ba.unlocked },
				tooltip: '进行一次第五行重置。\n奖励: 永远保留 2/3/4 行里程碑，"永恒" 可以被额外完成 10 次。',
				image: "images/achs/71.png",
			},
			72: {
				name: "生成器慢点",
				done() { return player.g.best.gte(1225) },
				tooltip: "达到 1,225 生成器。",
				image: "images/achs/72.png",
			},
			73: {
				name: "感觉很熟悉？",
				done() { return player.ps.unlocked },
				tooltip: "解锁幽魂。",
				image: "images/achs/73.png",
			},
			74: {
				name: "超级平衡",
				done() { return player.ba.points.gte(1e100) },
				tooltip: '达到 1e100 平衡。\n距离: "永恒" 可以被额外完成 10 次，"D 选项" 同样加成魔法和平衡获取。',
				image: "images/achs/74.png",
			},
			75: {
				name: "完美练习",
				unlocked() { return hasAchievement("a", 111) },
				done() { return player.ma.mastered.includes("m")&&player.ma.mastered.includes("ba")&&player.ma.mastered.includes("ps") },
				tooltip: "镀金魔法、平衡和幽魂。",
				image: "images/achs/75.png",
			},
			81: {
				name: "是的我的是",
				done() { return player.hn.unlocked },
				tooltip: '进行一次荣耀重置。\n奖励: 障碍不再重置你的声望和增幅器升级。',
				image: "images/achs/81.png",
			},
			82: {
				name: "不再是障碍了",
				done() { return player.points.gte("ee7") && player.h.activeChallenge>20 },
				tooltip: "在前两个之外的挑战中达到 e10,000,000 点数。",
				image: "images/achs/82.png",
			},
			83: {
				name: "不可能的任务",
				done() { return hasMilestone("hn", 7) },
				tooltip: "解锁幽魂增幅器。",
				image: "images/achs/83.png",
			},
			84: {
				name: "超越基础",
				done() { return player.points.gte("e9250000") && player.b.best.eq(0) && player.g.best.eq(0) },
				tooltip: "无增幅器和生成器达到 e9,250,000 点数。",
				image: "images/achs/84.png",
			},
			85: {
				name: "我理解你的痛苦",
				unlocked() { return hasAchievement("a", 111) },
				done() { return player.ma.mastered.includes("hn") },
				tooltip: "镀金荣耀。",
				image: "images/achs/85.png",
			},
			91: {
				name: "SPAAACE!!!!",
				done() { return player.n.unlocked || player.hs.unlocked },
				tooltip: "解锁星云或超空间。\n奖励: 荣耀获取增多 10%。",
				image: "images/achs/91.png",
			},
			92: {
				name: "银河",
				done() { return player.n.unlocked && player.hs.unlocked },
				tooltip: "解锁星云和超空间。\n奖励: 星云和超空间以首先选择其的方式运行。",
				image: "images/achs/92.png",
			},
			93: {
				name: "单位取消",
				done() { return player.i.unlocked },
				tooltip: "解锁帝国。",
				image: "images/achs/93.png",
			},
			94: {
				name: "终于打完障碍了",
				done() { return player.h.challenges[31]>=30 && player.h.challenges[32]>=10 },
				tooltip: '完成 30 次 "永恒" 和 10 次 "D 选项"。',
				image: "images/achs/94.png",
			},
			95: {
				name: "我讨厌这个机修",
				unlocked() { return hasAchievement("a", 111) },
				done() { return player.ma.mastered.includes("n")||player.ma.mastered.includes("hs") },
				tooltip: "镀金星云或超空间。\n奖励: 专精价格下降 15%。",
				image: "images/achs/95.png",
			},
			101: {
				name: "不可能领域",
				done() { return player.q.points.gte("e1e6") },
				tooltip: "达到 e1,000,000 诡异。\n奖励: 诡异层价格底数降低 0.2。",
				image: "images/achs/101.png",
			},
			102: {
				name: "我们不是在这之后吗？",
				done() { return inChallenge("h", 31) && player.h.challenges[31]>=30 && player.points.gte("e2e7") },
				tooltip: '在 "永恒" 障碍中达到 e20,000,000 点数（障碍需要至少被完成 30 次）。',
				image: "images/achs/102.png",
			},
			103: {
				name: "十亿个 0",
				done() { return player.points.gte("e1e9") },
				tooltip: "达到 e1e9 点数。\n奖励：建筑增益 +10%。",
				image: "images/achs/103.png",
			},
			104: {
				name: "集群",
				done() { return player.n.buyables[11].gte(5) },
				tooltip: "购买 5 星团。",
				image: "images/achs/104.png",
			},
			105: {
				name: "真正的建筑",
				unlocked() { return hasAchievement("a", 111) },
				done() { return player.ma.mastered.includes("i") },
				tooltip: "镀金砖石。",
				image: "images/achs/105.png",
			},
			111: {
				name: "造物之地",
				done() { return player.ma.unlocked },
				tooltip: '进行一次专精重置。\n奖励: 对任何重置保留帝国建筑 II，你可以大批量完成 "永恒" 和 "D 选项"，这些障碍不会随完成次数提高而变难，解锁一列新成就。',
				image: "images/achs/111.png",
			},
			112: {
				name: "真实支配",
				done() { return player.ma.points.gte(10) },
				tooltip: "达到 10 专精。",
				image: "images/achs/112.png",
			},
			113: {
				name: "一万亿个 0",
				done() { return player.points.gte("ee12") },
				tooltip: "达到 e1e12 点数。\n奖励: 超建筑增益 +10%。",
				image: "images/achs/113.png",
			},
			114: {
				name: "E 选项？",
				done() { return player.h.challenges[32]>=900 },
				tooltip: '完成 "D 选项" 至少 900 次。',
				image: "images/achs/114.png",
			},
			115: {
				name: "永恒缠身",
				unlocked() { return hasAchievement("a", 111) },
				done() { return player.ps.points.gte(1350) },
				tooltip: "达到 1,375 幽魂。\n奖励: 命令行扩展对齿轮大小的削弱改为增强。",
				image: "images/achs/115.png",
			},
			121: {
				name: "准备好了吗",
				done() { return player.ge.unlocked },
				tooltip() { return "解锁齿轮。\n奖励: 总超空间延缓超建筑软上限"+(tmp.nerdMode?" (公式: (x^0.2)/100)":" (当前: +"+format(player.hs.buyables[11].root(5).times(.1))+")") },
				image: "images/achs/121.png",
			},
			122: {
				name: "过多齿！",
				done() { return tmp.ge.teeth.gte(1e4) },
				tooltip: "使你的齿轮有至少 10,000 齿。",
				image: "images/achs/122.png",
			},
			123: {
				name: "年太阳能发电量",
				done() { return player.ge.energy.gte(1.2e34) },
				tooltip: "达到 1.2e34 J 动能。\n奖励: 动能升级效果翻四倍。",
				image: "images/achs/123.png",
			},
			124: {
				name: "完美之人",
				done() { return player.hn.points.gte("ee6") },
				tooltip: "达到 e1,000,000 荣耀。\n奖励: 齿轮进化价格需要 3 倍少的转速，同时增强 20%。",
				image: "images/achs/124.png",
			},
			125: {
				name: "无底洞",
				unlocked() { return hasAchievement("a", 111) },
				done() { return player.points.gte("e2.5e13") && inChallenge("h", 42) },
				tooltip: '在 "减产" 障碍中达到 e2.5e13 点数。',
				image: "images/achs/125.png",
			},
			131: {
				name: "人工无意识",
				done() { return player.mc.unlocked },
				tooltip: "解锁机械。\n奖励: 专精价格降低 10%。",
				image: "images/achs/131.png",
			},
			132: {
				name: "龟龟神",
				done() { return player.mc.buyables[11].gte(200) },
				tooltip: "命令行大小超过 200m。\n奖励: 命令行扩展的效果提升至 5 次幂，其价格除以 7，获得 2 个免费的齿轮进化。",
				image: "images/achs/132.png",
			},
			133: {
				name: "突破屏障",
				done() { return player.mc.mechEn.times(tmp.mc.mechEnMult).gte("1e375") },
				tooltip: "达到 1e375 机械能量。\n奖励: 你可以同时启用两个主板功能，北桥效果提升至立方，启用一个新的齿轮升级。",
				image: "images/achs/133.png",
			},
			134: {
				name: "内心的渴望",
				done() { return player.mc.upgrades.includes(11) },
				tooltip() { return "解锁核心。\n奖励: 每个幽魂降价专精价格 0.0075%。 (当前降价: "+format(Decimal.sub(1, Decimal.pow(.999925, player.ps.points)).times(100))+"%)" },
				image: "images/achs/134.png",
			},
			135: {
				name: "一千万亿个零！",
				unlocked() { return hasAchievement("a", 111) },
				done() { return player.points.gte("ee15") },
				tooltip: "达到 e1e15 点数。",
				image: "images/achs/135.png",
			},
			141: {
				name: "思维强大",
				done() { return player.en.unlocked || player.ne.unlocked },
				tooltip: "解锁能量或神经元。\n奖励: 你可以同时激活主板的所有效果。",
				image: "images/achs/141.png",
			},
			142: {
				name: "失败",
				done() { return player.en.sw.gte(104) },
				tooltip: "达到 104 超级能量。",
				image: "images/achs/142.png",
			},
			143: {
				name: "「大」脑",
				done() { return inChallenge("ne", 11) && player.points.gte("e5e11") },
				tooltip: "在大脑中达到 e5e11 点数。\n奖励: 三倍信号获取。",
				image: "images/achs/143.png",
			},
			144: {
				name: "修脚",
				done() { return player.mc.points.gte(1e11) },
				tooltip: "达到 1e11 组件。",
				image: "images/achs/144.png",
			},
			145: {
				name: "中心旋转",
				unlocked() { return hasAchievement("a", 111) },
				done() { return player.ge.rotations.gte(2.5e19) && player.ge.boosted.eq(0) },
				tooltip: "无齿轮升级达到 2.5e19 转速。",
				image: "images/achs/145.png",
			},
			151: {
				name: "计划胜利",
				done() { return player.id.unlocked && player.r.unlocked },
				tooltip: "解锁机器人和想法。\n奖励: 永久保留能量里程碑 1-3 & 5，在大脑之外以降低速度获得信号。",
				image: "images/achs/151.png",
			},
			152: {
				name: "不太重要",
				done() { return player.g.power.gte("ee12") },
				tooltip: "达到 e1e12 GP。\n奖励: GP 效果提升至 1.4 次幂。",
				image: "images/achs/152.png",
			},
			153: {
				name: "加冕",
				done() { return player.hn.points.gte(Decimal.pow(10, 1e8)) },
				tooltip: "达到 e100,000,000 荣耀。",
				image: "images/achs/153.png",
			},
			154: {
				name: "悬浮棱镜",
				done() { return player.ne.thoughts.gte(625) && player.ne.points.lt(player.id.points) },
				tooltip: "在神经元少于想法的情况下，达到 625 思考。",
				image: "images/achs/154.png",
			},
			155: {
				name: "超级大脑",
				unlocked() { return hasAchievement("a", 111) },
				done() { return player.ne.thoughts.gte(1000) },
				tooltip: "达到 1,000 思考。\n 奖励: 想法效果增加 0.005。",
				image: "images/achs/155.png",
			},
			161: {
				name: "世界属于我们！",
				done() { return player.ai.unlocked },
				tooltip: "解锁 AI。\n奖励: 永远保留神经元里程碑 6、机器人里程碑 2 和 5、想法里程碑 4。",
				image: "images/achs/161.png",
			},
			162: {
				name: "这功能咋没用啊？",
				done() { return tmp.id.rev.gte(1650) && player.ai.upgrades.length==0 },
				tooltip: "无 AI 节点达到 1,650 启示。",
				image: "images/achs/162.png",
			},
			163: {
				name: "坐拥天下",
				done() { return player.c.unlocked },
				tooltip() { return "解锁文明。\n奖励: 想法乘以人工意识获取，这一行及以下的每个成就将专精需求除以 1.1（/"+format(Decimal.pow(1.1, player.a.achievements.filter(x => x>160).length))+"）。" },
				image: "images/achs/163.png",
			},
			164: {
				name: "存在即错误",
				done() { return player.c.buyables[11].gte(1) },
				tooltip() { return "获得至少 1 人口。\n奖励: 永远保留想法里程碑 1/5，每人口降低文明力量需求 2（-"+formatWhole(player.c.buyables[11].times(2).min(100))+"，上限位于 -100）。" },
				image: "images/achs/164.png",
			},
			165: {
				name: "F 选项？",
				unlocked() { return hasAchievement("a", 111) },
				done() { return player.h.challenges[32]>=1e6 },
				tooltip: "完成 D 选项至少 1e6 次。",
				image: "images/achs/165.png",
			},
		},
		tabFormat: [
			"blank", 
			["display-text", function() { return "成就: "+player.a.achievements.length+"/"+(Object.keys(tmp.a.achievements).length-2) }], 
			"blank", "blank",
			"achievements",
		],
		update(diff) {	// Added this section to call adjustNotificationTime every tick, to reduce notification timers
			adjustNotificationTime(diff);
		},	
    }, 
)
/*























*/
addLayer("sc", {
	startData() { return {unlocked: true}},
	color: "#e6ff69",
	symbol: "SC",
	row: "side",
	layerShown() { return hasAchievement("a", 21) && player.scShown },
	tooltip: "软上限",
	tabFormat: [
		"blank", "blank", "blank",
		["raw-html", function() {
			let html = ""
			for (let id in SOFTCAPS) {
				let data = SOFTCAPS[id];
				if (data.display) if (data.display()) {
					html += "<div><h3>"+data.title+"</h3><br>"+data.info();
					html += "</div><br><br>";
				}
			}
			return html;
		}],
	],
}) 
/*
                                      
                  bbbbbbbb            
                  b::::::b            
                  b::::::b            
                  b::::::b            
                   b:::::b            
  aaaaaaaaaaaaa    b:::::bbbbbbbbb    
  a::::::::::::a   b::::::::::::::bb  
  aaaaaaaaa:::::a  b::::::::::::::::b 
           a::::a  b:::::bbbbb:::::::b
    aaaaaaa:::::a  b:::::b    b::::::b
  aa::::::::::::a  b:::::b     b:::::b
 a::::aaaa::::::a  b:::::b     b:::::b
a::::a    a:::::a  b:::::b     b:::::b
a::::a    a:::::a  b:::::bbbbbb::::::b
a:::::aaaa::::::a  b::::::::::::::::b 
 a::::::::::aa:::a b:::::::::::::::b  
  aaaaaaaaaa  aaaa bbbbbbbbbbbbbbbb   
                                      
                                      
                                      
                                      
                                      
                                      
                                      
*/
addLayer("ab", {
	startData() { return {unlocked: true}},
	color: "yellow",
	symbol: "AB",
	row: "side",
	layerShown() { return player.t.unlocked || player.s.unlocked },
	tooltip: "自动购买",
	clickables: {
		rows: 6,
		cols: 4,
		11: {
			title: "增幅器",
			display(){
				return hasMilestone("t", 3)?(player.b.auto?"开":"关"):"禁用"
			},
			unlocked() { return player.t.unlocked },
			canClick() { return hasMilestone("t", 3) },
			onClick() { player.b.auto = !player.b.auto },
			style: {"background-color"() { return player.b.auto?"#6e64c4":"#666666" }},
		},
		12: {
			title: "生成器",
			display(){
				return hasMilestone("s", 3)?(player.g.auto?"开":"关"):"禁用"
			},
			unlocked() { return player.s.unlocked },
			canClick() { return hasMilestone("s", 3) },
			onClick() { player.g.auto = !player.g.auto },
			style: {"background-color"() { return player.g.auto?"#a3d9a5":"#666666" }},
		},
		13: {
			title: "增强子",
			display(){
				return hasMilestone("q", 1)?(player.e.auto?"开":"关"):"禁用"
			},
			unlocked() { return player.q.unlocked },
			canClick() { return hasMilestone("q", 1) },
			onClick() { player.e.auto = !player.e.auto },
			style: {"background-color"() { return player.e.auto?"#b82fbd":"#666666" }},
		},
		14: {
			title: "扩展时间胶囊",
			display(){
				return hasMilestone("q", 1)?(player.t.autoExt?"开":"关"):"禁用"
			},
			unlocked() { return player.q.unlocked },
			canClick() { return hasMilestone("q", 1) },
			onClick() { player.t.autoExt = !player.t.autoExt },
			style: {"background-color"() { return player.t.autoExt?"#006609":"#666666" }},
		},
		21: {
			title: "时间胶囊",
			display(){
				return hasMilestone("q", 3)?(player.t.auto?"开":"关"):"禁用"
			},
			unlocked() { return player.q.unlocked },
			canClick() { return hasMilestone("q", 3) },
			onClick() { player.t.auto = !player.t.auto },
			style: {"background-color"() { return player.t.auto?"#006609":"#666666" }},
		},
		22: {
			title: "空间能量",
			display(){
				return hasMilestone("q", 3)?(player.s.auto?"开":"关"):"禁用"
			},
			unlocked() { return player.q.unlocked },
			canClick() { return hasMilestone("q", 3) },
			onClick() { player.s.auto = !player.s.auto },
			style: {"background-color"() { return player.s.auto?"#dfdfdf":"#666666" }},
		},
		23: {
			title: "超级增幅器",
			display(){
				return hasMilestone("q", 4)?(player.sb.auto?"开":"关"):"禁用"
			},
			unlocked() { return player.q.unlocked },
			canClick() { return hasMilestone("q", 4) },
			onClick() { player.sb.auto = !player.sb.auto },
			style: {"background-color"() { return player.sb.auto?"#504899":"#666666" }},
		},
		24: {
			title: "超级生成器",
			display(){
				return hasMilestone("q", 6)?(player.sg.auto?"开":"关"):"禁用"
			},
			unlocked() { return player.sg.unlocked },
			canClick() { return hasMilestone("q", 6) },
			onClick() { player.sg.auto = !player.sg.auto },
			style: {"background-color"() { return player.sg.auto?"#248239":"#666666" }},
		},
		31: {
			title: "建筑",
			display(){
				return hasMilestone("q", 7)?(player.s.autoBld?"开":"关"):"禁用"
			},
			unlocked() { return player.sg.unlocked },
			canClick() { return hasMilestone("q", 7) },
			onClick() { player.s.autoBld = !player.s.autoBld },
			style: {"background-color"() { return player.s.autoBld?"#dfdfdf":"#666666" }},
		},
		32: {
			title: "诡异层",
			display(){
				return hasMilestone("ba", 1)?(player.q.auto?"开":"关"):"禁用"
			},
			unlocked() { return player.ba.unlocked },
			canClick() { return hasMilestone("ba", 1) },
			onClick() { player.q.auto = !player.q.auto },
			style: {"background-color"() { return player.q.auto?"#c20282":"#666666" }},
		},
		33: {
			title: "子空间能量",
			display(){
				return hasMilestone("ba", 2)?(player.ss.auto?"开":"关"):"禁用"
			},
			unlocked() { return player.ba.unlocked },
			canClick() { return hasMilestone("ba", 2) },
			onClick() { player.ss.auto = !player.ss.auto },
			style: {"background-color"() { return player.ss.auto?"#e8ffff":"#666666" }},
		},
		34: {
			title: "施法",
			display(){
				return hasMilestone("hn", 2)?(player.m.auto?"开":"关"):"禁用"
			},
			unlocked() { return player.hn.unlocked },
			canClick() { return hasMilestone("hn", 2) },
			onClick() { player.m.auto = !player.m.auto },
			style: {"background-color"() { return player.m.auto?"#eb34c0":"#666666" }},
		},
		41: {
			title: "幽魂",
			display(){
				return hasMilestone("hn", 4)?(player.ps.auto?"开":"关"):"禁用"
			},
			unlocked() { return player.hn.unlocked },
			canClick() { return hasMilestone("hn", 4) },
			onClick() { player.ps.auto = !player.ps.auto },
			style: {"background-color"() { return player.ps.auto?"#b38fbf":"#666666" }},
		},
		42: {
			title: "幽灵",
			display(){
				return hasMilestone("hn", 5)?(player.ps.autoW?"开":"关"):"禁用"
			},
			unlocked() { return player.hn.unlocked },
			canClick() { return hasMilestone("hn", 5) },
			onClick() { player.ps.autoW = !player.ps.autoW },
			style: {"background-color"() { return player.ps.autoW?"#b38fbf":"#666666" }},
		},
		43: {
			title: "灵魂",
			display(){
				return hasMilestone("ma", 0)?(player.ps.autoGhost?"开":"关"):"禁用"
			},
			unlocked() { return player.ma.unlocked },
			canClick() { return hasMilestone("ma", 0) },
			onClick() { player.ps.autoGhost = !player.ps.autoGhost },
			style: {"background-color"() { return player.ps.autoGhost?"#b38fbf":"#666666" }},
		},
		44: {
			title: "砖石",
			display(){
				return hasMilestone("ma", 4)?(player.i.auto?"开":"关"):"禁用"
			},
			unlocked() { return player.ma.unlocked },
			canClick() { return hasMilestone("ma", 4) },
			onClick() { player.i.auto = !player.i.auto },
			style: {"background-color"() { return player.i.auto?"#e5dab7":"#666666" }},
		},
		51: {
			title: "超空间",
			display(){
				return hasMilestone("ma", 5)?(player.hs.auto?"开":"关"):"禁用"
			},
			unlocked() { return player.ma.unlocked },
			canClick() { return hasMilestone("ma", 5) },
			onClick() { player.hs.auto = !player.hs.auto },
			style: {"background-color"() { return player.hs.auto?"#dfdfff":"#666666" }},
		},
		52: {
			title: "齿轮升级",
			display() { return hasMilestone("ge", 3)?(player.ge.auto?"开":"关"):"禁用" },
			unlocked() { return player.ai.unlocked && player.ge.unlocked },
			canClick() { return hasMilestone("ge", 3) },
			onClick() { player.ge.auto = !player.ge.auto },
			style: {"background-color"() { return player.ge.auto?"#ababab":"#666666" }},
		},
		53: {
			title: "命令行扩展",
			display() {
				return hasMilestone("id", 3)?(player.mc.autoSE?"开":"关"):"禁用"
			},
			unlocked() { return player.id.unlocked && player.mc.unlocked },
			canClick() { return hasMilestone("id", 3) },
			onClick() { player.mc.autoSE = !player.mc.autoSE },
			style: {"background-color"() { return player.mc.autoSE?"#c99a6b":"#666666" }},
		},
		54: {
			title: "主板",
			display() { return hasMilestone("mc", 1)?(player.mc.auto?"开":"关"):"禁用" },
			unlocked() { return player.ai.unlocked && player.mc.unlocked },
			canClick() { return hasMilestone("mc", 1) },
			onClick() { player.mc.auto = !player.mc.auto },
			style: {"background-color"() { return player.mc.auto?"#c99a6b":"#666666" }},
		},
		61: {
			title: "神经元",
			display() {
				return hasMilestone("ne", 5)?(player.ne.auto?"开":"关"):"禁用"
			},
			unlocked() { return player.ne.unlocked && player.en.unlocked },
			canClick() { return hasMilestone("ne", 5) },
			onClick() { player.ne.auto = !player.ne.auto },
			style: {"background-color"() { return player.ne.auto?"#ded9ff":"#666666" }},
		},
		62: {
			title: "神经网络",
			display() {
				return hasMilestone("ne", 7)?(player.ne.autoNN?"开":"关"):"禁用"
			},
			unlocked() { return player.ne.unlocked && player.ai.unlocked },
			canClick() { return hasMilestone("ne", 7) },
			onClick() { player.ne.autoNN = !player.ne.autoNN },
			style: {"background-color"() { return player.ne.autoNN?"#ded9ff":"#666666" }},
		},
		63: {
			title: "想法",
			display() { return hasMilestone("id", 4)?(player.id.auto?"开":"关"):"禁用" },
			unlocked() { return player.id.unlocked && player.ai.unlocked },
			canClick() { return hasMilestone("id", 4) },
			onClick() { player.id.auto = !player.id.auto },
			style: {"background-color"() { return player.id.auto?"#fad682":"#666666" }},
		},
	},
})