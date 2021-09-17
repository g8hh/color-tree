/*
addLayer("p", {
    name: "prestige", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "P", // This appears on the layer's node. Default is the id with the first letter capitalized
    branches: [],
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#4BDC13",
    requires: new Decimal(10), // Can be a function that takes requirement increases into account
    resource: "prestige points", // Name of prestige currency
    baseResource: "points", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 0, // Row the layer is in on the tree (0 is the first row)
    effect() {
        return new Decimal(1)
    },
    effectDescription() { // Optional text to describe the effects
        eff = this.effect()
        return eff
    },
    upgrades: {

    },
    milestones: {

    },
    buyables: {

    },
    hotkeys: [
        {key: "p", description: "P: Reset for prestige points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return true}
})
*/

addLayer("w", {
    name: "white", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "W", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#FFFFFF",
    requires: new Decimal(1), // Can be a function that takes requirement increases into account
    resource: "white points", // Name of prestige currency
    baseResource: "particles", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        if (hasUpgrade(this.layer, 14)) mult = mult.times(2)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 0, // Row the layer is in on the tree (0 is the first row)
    effect() {
        let mult = player[this.layer].points.add(1).pow(1/8)
        if (hasUpgrade(this.layer, 11)) mult = mult.pow(1.5)
        if (hasUpgrade(this.layer, 12)) mult = mult.pow(1.5)
        if (hasUpgrade(this.layer, 21)) mult = mult.pow(2)
        return mult
    },
    effectDescription() { // Optional text to describe the effects
        eff = this.effect()
        return `which multiples particles gain by ${format(eff)}`
    },
    upgrades: {
        rows: 2,
        cols: 5,
        11: {
            title: "Neutron Star",
            description: "White effect makes 50% stronger.",
            cost: new Decimal(3),
            unlocked() { return player[this.layer].unlocked },
        },
        12: {
            title: "Leucanthemum",
            description: "White effect makes 50% more stronger.",
            cost: new Decimal(9),
            unlocked() { return hasUpgrade(this.layer, 11) },
        },
        13: {
            title: "School Chalk",
            description: "Gain particles based on unspent particles.",
            cost: new Decimal(16),
            unlocked() { return hasUpgrade(this.layer, 12) },
            effect() {
                let ret = player.points.add(1).log10().add(1).pow(1.25)
                return ret;
            },
            effectDisplay() { return format(this.effect())+"x" },
        },
        14: {
            title: "Paper",
            description: "Double white points gain.",
            cost: new Decimal(32),
            unlocked() { return hasUpgrade(this.layer, 13) },
        },
        15: {
            title: "Soap",
            description: "Unlock the first buyable.",
            cost: new Decimal(64),
            unlocked() { return hasUpgrade(this.layer, 14) },
        },
        21: {
            title: "Calcium",
            description: "White effect makes 100% more stronger, and <b>Diorite</b> effect makes 15% stronger.",
            cost: new Decimal(256),
            unlocked() { return hasUpgrade(this.layer, 15) },
        },
    },
    buyables: {
        rows: 1,
        cols: 1,
        showRespec: false,
        11: {
            title: "Diorite", // Optional, displayed at the top in a larger font
            cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                let cost = Decimal.pow(2, x).times(10).times(Decimal.pow(1.001, x.pow(2)))
                return cost.floor()
            },
            effect(x=player[this.layer].buyables[this.id]) { // Effects of owning x of the items, x is a decimal
                if (hasUpgrade(this.layer, 21)) x = x.times(1.15)
                let eff = Decimal.pow(1.5, x)
                return eff;
            },
            display() { // Everything else displayed in the buyable button after the title
                let data = tmp[this.layer].buyables[this.id]
                return "Cost: " + format(data.cost,0) + " white points\n\
                Amount: " + format(player[this.layer].buyables[this.id], 0) + "\n\
                Multiples points gain by " + format(data.effect)
            },
            unlocked() { return hasUpgrade('w', 15) }, 
            canAfford() {
                return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost)},
            buy() { 
                cost = tmp[this.layer].buyables[this.id].cost
                player[this.layer].points = player[this.layer].points.sub(cost)	
                player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
            },
        },
    },
    tabFormat: {
        'Upgrades': {
            content: [
                "main-display",
                "prestige-button",
                "blank",
                "milestones",
                "blank",
                "upgrades"
            ]
        },
        'Buyables': {
            unlocked() { return hasUpgrade('w', 15) },
            content: [
                ['display-text', function(x) { return `You have ${format(player.w.points, 0)} white points.` }],
                "blank",
                "buyables"
            ]
        },
    },
    hotkeys: [
        {key: "w", description: "W: Reset for white points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return true}
})

/*
addLayer("r", {
    name: "red", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "R", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    branches: ['w'],
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#FF0000",
    requires: new Decimal(100000), // Can be a function that takes requirement increases into account
    resource: "red points", // Name of prestige currency
    baseResource: "particles", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 1/4, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 1, // Row the layer is in on the tree (0 is the first row)
    effect() {
        return new Decimal(1)
    },
    effectDescription() { // Optional text to describe the effects
        
    },
    upgrades: {

    },
    milestones: {

    },
    buyables: {

    },
    hotkeys: [
        {key: "r", description: "R: Reset for red points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return player.w.unlocked}
})
*/