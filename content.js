const STAT_BLOCK = `mon-stat-block__`
let monster = {}

const handleScrape = () => {
  const elements = {
    header: document.querySelector(`.${STAT_BLOCK}header`),
    attributes: document.querySelector(`.${STAT_BLOCK}attributes`),
    statBlock: document.querySelector(`.${STAT_BLOCK}stat-block`),
    tidbits: document.querySelector(`.${STAT_BLOCK}tidbits`),
    descriptionBlocks: document.querySelector(`.${STAT_BLOCK}description-blocks`)
  }
  buildMonsterStats(elements)
}

const getStatText = (element = document, name) => element.querySelector(`.${STAT_BLOCK}${name}`).innerText

const buildSpeeds = (text) => {
  const speed = {}
  text.split(", ").forEach((s,i) => {
    if (i === 0) {
      speed.walk = s
    } else {
      speed[s.split(" ")[0]] = `${s.split(" ")[1]} ft.`
    }
  });
  return speed
}

const buildTidbit = tidbit => {
  const label = tidbit.querySelector(`.${STAT_BLOCK}tidbit-label`).innerText
  let data = tidbit.querySelector(`.${STAT_BLOCK}tidbit-data`).innerText

  if (!label || !data) {
    return null
  }

  const buildArray = () => {
    data = data.split(";")
    const arr = [...data[0].split(", ")]
    data[1] && arr.push(data[1])
    return arr
  }

  switch (label) {
    case "Saving Throws":
      data = "Saving Throw: " + data.replace(", ", " | Saving Throw: ")
      monster.proficiencies = monster.proficiencies ? monster.proficiencies + " | " + data : data
      break;
    case "Skills":
      data = "Skill: " + data.replace(", ", " | Skill: ")
      monster.proficiencies = monster.proficiencies ? monster.proficiencies + " | " + data : data
      break;
    case "Damage Resistances":
      monster.damage_resistances = buildArray()
      break;
    case "Damage Immunities":
      monster.damage_immunities = buildArray()
      break;
    case "Damage Vulnerabilities":
      monster.damage_vulnerabilities = buildArray()
      break;
    case "Condition Immunities":
      monster.condition_immunities = buildArray()
      break;
    case "Senses":
      monster.senses = data.replace(", "," | ")
      break;
    case "Languages":
      monster.languages = data
      break;
    case "Challenge":
      monster.challenge_rating = data.split(" ")[0]
      monster.xp = parseInt(data.match(/\((.*?)\)/)[1].replace(",",""))
      break;
    default:
      console.log("wasn't able to build tidbit from that")

  }
}

const buildAction = p => {

  const spell_modifier = p.innerText.match(/\+[0-9]+ to hit with spell attacks/)
  if (spell_modifier) {
    monster.spell_modifier = parseInt(spell_modifier[0].replace(" to hit with spell attacks", ""))
  }

  const spell_dc = p.innerText.match(/spell save DC [0-9]+/)
  if (spell_dc) {
    monster.spell_dc = parseInt(spell_dc[0].replace("spell save DC", ""))
  }

  const spell_level = p.innerText.match(/is an [0-9]+[a-z]+-level spellcaster/)
  if (spell_level) {
    monster.spell_level = parseInt(spell_dc[0].match(/[0-9]+/)[0])
  }

  const cantrips = p.innerText.match(/Cantrips \(at will\):[,' a-z]*/)
  if (cantrips && cantrips[0]) {
    const spells = cantrips[0].split(": ")[1].split(", ").map(sp => {
      return {
        name: sp,
        level: 0
      }
    })
    monster.spells = [...monster.spells, ...spells]
  }

  const innateSpells = p.innerText.match(/[1-9]\/day[:,' a-z]*/)
  if (innateSpells && innateSpells[0]) {
    const spells = innateSpells[0].split(": ")[1].split(", ").map(sp => {
      return {
        name: sp.replace(/\([\w]*\)/, "").trim(),
        level: 0
      }
    })
    monster.spells = [...monster.spells, ...spells]
  }

  const leveledSpells = p.innerText.match(/[1-9][a-z]* level \([0-9] slot[s]*\):[a-z ,']*/)
  if (leveledSpells && leveledSpells[0]) {
    const level = leveledSpells[0][0]
    const spells = leveledSpells[0].split(": ")[1].split(", ").map(sp => {
      return {
        name: sp,
        level
      }
    })
    leveledSpells[0]
    monster.spell_slots = {...monster.spell_slots, [level]: parseInt(leveledSpells[0].match(/[0-9] slot[s]*/)[0])}
    monster.spells = [...monster.spells, ...spells]
  }

  if (p.querySelector('em')) {
    const name = p.querySelector('em').innerText

    return {
      name: name.replace(". ", ""),
      desc: p.innerText.replace(name, "")
    }
  }
}

const buildDescriptionBlocks = descriptionBlocks => {
  Array.from(descriptionBlocks.children).forEach(block => {
    const sectionTitle = block.children[0].innerText
    if (sectionTitle === "Actions") {
      monster.actions = Array.from(block.querySelectorAll('p')).map(p => buildAction(p)).filter(a => !!a)
    } else if (sectionTitle === "Reactions") {
      monster.reactions = Array.from(block.querySelectorAll('p')).map(p => buildAction(p)).filter(a => !!a)
    } else if (sectionTitle === "Legendary Actions") {
      monster.legendary_actions = Array.from(block.querySelectorAll('p')).map(p => buildAction(p)).filter(a => !!a)
    } else {
      monster.special_abilities = Array.from(block.querySelectorAll('p')).map(p => buildAction(p)).filter(a => !!a)
    }
  })
}

const download = () => {
    var a = document.createElement("a");
    var file = new Blob([JSON.stringify(monster)], {type: 'text/plain'})
    a.href = URL.createObjectURL(file);
    a.download = `${monster.index}.json`
    a.click();
    a.remove()
}

const buildMonsterStats = (elements) => {
  const {header, attributes, statBlock, tidbits, descriptionBlocks} = elements

  monster = {
    index: getStatText(header, `name-link`).toLowerCase().replace(` `,`-`),
    name: getStatText(header, `name-link`),
    size: getStatText(header, `meta`).split(` `)[0],
    type: getStatText(header, `meta`).split(` `)[1],
    subtype: getStatText(header, `meta`).match(/\((.*?)\)/) && getStatText(header, `meta`).match(/\((.*?)\)/)[1],
    alignment: getStatText(header, `meta`).split(`,`)[1],
    armor_class: parseInt(attributes.querySelectorAll(`.${STAT_BLOCK}attribute-data-value`)[0].innerText),
    hit_points: parseInt(attributes.querySelectorAll(`.${STAT_BLOCK}attribute-data-value`)[1].innerText),
    hit_dice: attributes.querySelectorAll(`.${STAT_BLOCK}attribute-data-extra`)[1].innerText.match(/[1-9]*d[1-9]*/)[0],
    speed: buildSpeeds(attributes.querySelectorAll(`.${STAT_BLOCK}attribute-data-value`)[2].innerText),
    strength: parseInt(statBlock.querySelectorAll(".ability-block__score")[0].innerText),
    dexterity: parseInt(statBlock.querySelectorAll(".ability-block__score")[1].innerText),
    constitution: parseInt(statBlock.querySelectorAll(".ability-block__score")[2].innerText),
    intelligence: parseInt(statBlock.querySelectorAll(".ability-block__score")[3].innerText),
    wisdom: parseInt(statBlock.querySelectorAll(".ability-block__score")[4].innerText),
    charisma: parseInt(statBlock.querySelectorAll(".ability-block__score")[5].innerText),
    spells: [],
    spell_slots: {},
    url: window.location.href
  }

  Array.from(tidbits.children).forEach(tidbit => {
    buildTidbit(tidbit)
  });

  buildDescriptionBlocks(descriptionBlocks)

  console.clear()
  console.log(monster);
  download()
}


const handleKeyPress = ({keyCode}) => {
  if (keyCode === 90) {
    try {
      handleScrape()
    } catch (e) {
      console.error(e)
    }
  }
}

document.addEventListener(`keyup`, handleKeyPress)
console.clear()
console.log("Monster scraper active");
