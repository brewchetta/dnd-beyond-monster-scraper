const STAT_BLOCK = `mon-stat-block__`

const handleOpenAllMonsterBlocks = () => {
  const infoBlocks = Array.from(document.querySelectorAll('div.info'))
  console.log(infoBlocks)
  for (i = 0; i < infoBlocks.length; i++) {
    infoBlocks[i].click()
  }
}

const handleScrape = () => {
  if (window.location.href.includes('/monsters/')) {
    buildMonsterStats()
  } else if (window.location.href.includes('/spells/')) {
    buildSpellData()
  } else if (window.location.href.includes('/monsters')) {
    const monsterBlocks = Array.from(document.querySelectorAll('div.more-info.more-info-monster'))
    for (i = 0; i < monsterBlocks.length; i++) {
      buildMonsterStats(monsterBlocks[i])
    }
  } else {
    console.error("Unable to scrape, invalid URL ( must be within /monsters, /monsters/ or /spells/ )")
  }
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

const buildTidbit = (tidbit, monster) => {
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
      data = "Saving Throw: " + data.replaceAll(", ", " | Saving Throw: ")
      monster.proficiencies = monster.proficiencies ? monster.proficiencies + " | " + data : data
      break;
    case "Skills":
      data = "Skill: " + data.replaceAll(", ", " | Skill: ")
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
      monster.senses = data.replaceAll(", "," | ")
      break;
    case "Languages":
      monster.languages = data
      break;
    case "Challenge":
      monster.challenge_rating = data.split(" ")[0]
      monster.xp = parseInt(data.match(/\((.*?)\)/)[1].replaceAll(",",""))
      break;
    default:
      console.log("wasn't able to build tidbit from that")

  }
}

const buildAction = (p, monster) => {

  const spell_modifier = p.innerText.match(/\+[0-9]+ to hit with spell attacks/)
  if (spell_modifier) {
    monster.spell_modifier = parseInt(spell_modifier[0].replaceAll(" to hit with spell attacks", ""))
  }

  const spell_dc = p.innerText.match(/spell save DC [0-9]+/)
  if (spell_dc) {
    monster.spell_dc = parseInt(spell_dc[0].replaceAll("spell save DC", ""))
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
        name: sp.replace(/\([\w]*\)/g, "").trim(),
        level: 0
      }
    })
    monster.spells = [...monster.spells, ...spells]
  }

  const leveledSpells = p.innerText.match(/[0-9][a-z]* level \([0-9] slot[s]*\):[a-z ,'*]*/)
  if (leveledSpells && leveledSpells[0]) {
    const level = parseInt(leveledSpells[0][0])
    const spells = leveledSpells[0].replaceAll("*","").split(": ")[1].split(", ").map(sp => {
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
      name: name.replaceAll(". ", ""),
      desc: p.innerText.replaceAll(name, "")
    }
  }
}

const buildDescriptionBlocks = (descriptionBlocks, monster) => {
  Array.from(descriptionBlocks.children).forEach(block => {
    const sectionTitle = block.children[0].innerText
    if (sectionTitle === "Actions") {
      monster.actions = Array.from(block.querySelectorAll('p')).map(p => buildAction(p, monster)).filter(a => !!a)
    } else if (sectionTitle === "Reactions") {
      monster.reactions = Array.from(block.querySelectorAll('p')).map(p => buildAction(p, monster)).filter(a => !!a)
    } else if (sectionTitle === "Legendary Actions") {
      monster.legendary_actions = Array.from(block.querySelectorAll('p')).map(p => buildAction(p, monster)).filter(a => !!a)
    } else {
      monster.special_abilities = Array.from(block.querySelectorAll('p')).map(p => buildAction(p, monster)).filter(a => !!a)
    }
  })
}

const download = (obj) => {
    var a = document.createElement("a");
    var file = new Blob([JSON.stringify(obj)], {type: 'text/plain'})
    a.href = URL.createObjectURL(file);
    a.download = `${obj.index}.json`
    a.click();
    a.remove()
}

// --- BUILD MONSTER STATS --- //

const buildMonsterStats = (containerElement=document) => {

  const elements = {
    header: containerElement.querySelector(`.${STAT_BLOCK}header`),
    attributes: containerElement.querySelector(`.${STAT_BLOCK}attributes`),
    statBlock: containerElement.querySelector(`.${STAT_BLOCK}stat-block`),
    tidbits: containerElement.querySelector(`.${STAT_BLOCK}tidbits`),
    descriptionBlocks: containerElement.querySelector(`.${STAT_BLOCK}description-blocks`)
  }

  const {header, attributes, statBlock, tidbits, descriptionBlocks} = elements
  // console.log(attributes.children[1].querySelector(`.${STAT_BLOCK}attribute-data-extra`).innerText)

  const sizesRegex = /(tiny|small|medium|large|huge|gargantuan)/gi
  const typesRegex = /(aberration|beast|celestial|construct|dragon|elemental|fey|fiend|giant|humanoid|monstrosity|ooze|plant|undead)/gi

  const monster = {
    index: getStatText(header, `name-link`).toLowerCase().replaceAll(` `,`-`),
    name: getStatText(header, `name-link`),
    size: getStatText(header, `meta`).match(sizesRegex)[0],
    type: getStatText(header, `meta`).match(typesRegex)[0],
    subtype: getStatText(header, `meta`).match(/\((.*?)\)/) && getStatText(header, `meta`).match(/\((.*?)\)/)[1],
    alignment: getStatText(header, `meta`).split(`,`)[1],
    armor_class: parseInt(attributes.querySelectorAll(`.${STAT_BLOCK}attribute-data-value`)[0].innerText),
    hit_points: parseInt(attributes.querySelectorAll(`.${STAT_BLOCK}attribute-data-value`)[1].innerText),
    hit_dice: attributes.children[1].querySelector(`.${STAT_BLOCK}attribute-data-extra`).innerText.match(/[0-9]*d[0-9]*/)[0],
    speed: buildSpeeds(attributes.querySelectorAll(`.${STAT_BLOCK}attribute-data-value`)[2].innerText),
    strength: parseInt(statBlock.querySelectorAll(".ability-block__score")[0].innerText),
    dexterity: parseInt(statBlock.querySelectorAll(".ability-block__score")[1].innerText),
    constitution: parseInt(statBlock.querySelectorAll(".ability-block__score")[2].innerText),
    intelligence: parseInt(statBlock.querySelectorAll(".ability-block__score")[3].innerText),
    wisdom: parseInt(statBlock.querySelectorAll(".ability-block__score")[4].innerText),
    charisma: parseInt(statBlock.querySelectorAll(".ability-block__score")[5].innerText),
    spells: [],
    spell_slots: {},
    url: window.location.href,
    source: containerElement.querySelector('p.source.monster-source')?.textContent?.replaceAll(/\n[ ]*/g, '') || containerElement.querySelector('div.more-info-footer-source')?.textContent?.replaceAll(/\n[ ]*/g, '')
  }

  Array.from(tidbits.children).forEach(tidbit => {
    buildTidbit(tidbit, monster)
  });

  buildDescriptionBlocks(descriptionBlocks, monster)

  console.clear()
  console.log(monster);
  download(monster)
}

// --- BUILD SPELL DATA --- //

const buildSpellData = () => {

  const spellObj = {}

  spellObj.index = window.location.href.split('/')[window.location.href.split('/').length - 1]

  spellObj.name = document.querySelector('h1.page-title').innerText

  const spellInfoDescriptions = Array.from( document.querySelectorAll('div.more-info-content p, div.more-info-content li') )
  
  spellObj.description = ''
  let liCounter = 0
  spellInfoDescriptions.forEach(el => {
    if (el.textContent.includes('At Higher Levels')) {
      spellObj.at_higher_levels = el.textContent
    } else if (el.tagName == 'LI' && el.parentElement.tagName == 'OL') {
      liCounter += 1
      spellObj.description += `${liCounter}. ${el.textContent}\n`
    } else {
      spellObj.description += el.textContent + '\n'
    }
  })
  
  const levelText = document.querySelector('div.ddb-statblock-item.ddb-statblock-item-level div.ddb-statblock-item-value').textContent.replaceAll(/\n| /g,'')
  if (levelText == 'Cantrip') {
    spellObj.level = 0
  } else {
    spellObj.level = parseInt(levelText)
  }

  spellObj.casting_time = document.querySelector('div.ddb-statblock-item.ddb-statblock-item-casting-time div.ddb-statblock-item-value').textContent.replaceAll(/([ ]*\n[ ]*)|(Ritual)/g, '')

  spellObj.ritual = !!document.querySelector('div.ddb-statblock-item.ddb-statblock-item-casting-time .i-ritual')

  spellObj.duration = document.querySelector('div.ddb-statblock-item.ddb-statblock-item-duration div.ddb-statblock-item-value').textContent.replaceAll(/([ ]*\n[ ]*)/g, '')

  spellObj.concentration = !!document.querySelector('div.ddb-statblock-item-duration i.i-concentration')

  spellObj.range_area = document.querySelector('div.ddb-statblock-item.ddb-statblock-item-range-area div.ddb-statblock-item-value').textContent.replaceAll(/([ ]*\n[ ]*)/g, '')

  const areaIcon = document.querySelector('div.ddb-statblock-item.ddb-statblock-item-range-area i')
  for (shape of ['cube', 'cone', 'line', 'cylinder', 'sphere', 'square']) {
    if (areaIcon && areaIcon.className.includes(shape)) {
      spellObj.range_area = spellObj.range_area.replace(')', '') + `${shape})`
    }
  }


  const componentsText = document.querySelector('div.ddb-statblock-item.ddb-statblock-item-components div.ddb-statblock-item-value').textContent.replaceAll(/([ ]*\n[ ]*)/g, '')

  spellObj.verbal = componentsText.includes('V')

  spellObj.somatic = componentsText.includes('S')

  spellObj.material = document.querySelector('span.components-blurb')?.textContent

  spellObj.school = document.querySelector('div.ddb-statblock-item.ddb-statblock-item-school div.ddb-statblock-item-value').textContent.replaceAll(/([ ]*\n[ ]*)/g, '')

  spellObj.attack_save = document.querySelector('div.ddb-statblock-item.ddb-statblock-item-attack-save div.ddb-statblock-item-value').textContent.replaceAll(/([ ]*\n[ ]*)/g, '')

  spellObj.damage_effect = document.querySelector('div.ddb-statblock-item.ddb-statblock-item-damage-effect div.ddb-statblock-item-value').textContent.replaceAll(/([ ]*\n[ ]*)/g, '')

  spellObj.source = document.querySelector('p.source.spell-source').textContent.replaceAll(/([ ]*\n[ ]*)/g, '')

  spellObj.url = window.location.href

  console.clear()
  console.log(spellObj);
  download(spellObj)
}


const handleKeyPress = ({keyCode}) => {
  if (keyCode === 90) {
    try {
      handleScrape()
    } catch (e) {
      console.error(e)
    }
  }
  if (keyCode === 88) {
    try {
      handleOpenAllMonsterBlocks()
    } catch (e) {
      console.error(e)
    }
  }
}

document.addEventListener(`keyup`, handleKeyPress)
console.clear()
console.log("Monster scraper active")