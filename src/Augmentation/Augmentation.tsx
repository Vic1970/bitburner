// Class definition for a single Augmentation object
import * as React from "react";
import { IMap } from "../types";

import { Faction } from "../Faction/Faction";
import { Factions } from "../Faction/Factions";
import { numeralWrapper } from "../ui/numeralFormat";
import { Money } from "../ui/React/Money";

import { Generic_fromJSON, Generic_toJSON, Reviver } from "../utils/JSONReviver";
import { FactionNames } from "../Faction/data/FactionNames";
import { IPlayer } from "../PersonObjects/IPlayer";
import { AugmentationNames } from "./data/AugmentationNames";
import { CONSTANTS } from "../Constants";
import { StaticAugmentations } from "./StaticAugmentations";
import { BitNodeMultipliers } from "../BitNode/BitNodeMultipliers";
import { getBaseAugmentationPriceMultiplier, getGenericAugmentationPriceMultiplier } from "./AugmentationHelpers";
import { initSoAAugmentations } from "./data/AugmentationCreator";

export interface AugmentationCosts {
  moneyCost: number;
  repCost: number;
}

export interface IConstructorParams {
  info: string | JSX.Element;
  stats?: JSX.Element | null;
  isSpecial?: boolean;
  moneyCost: number;
  name: string;
  prereqs?: string[];
  repCost: number;
  factions: string[];

  hacking_mult?: number;
  strength_mult?: number;
  defense_mult?: number;
  dexterity_mult?: number;
  agility_mult?: number;
  charisma_mult?: number;
  hacking_exp_mult?: number;
  strength_exp_mult?: number;
  defense_exp_mult?: number;
  dexterity_exp_mult?: number;
  agility_exp_mult?: number;
  charisma_exp_mult?: number;
  hacking_chance_mult?: number;
  hacking_speed_mult?: number;
  hacking_money_mult?: number;
  hacking_grow_mult?: number;
  company_rep_mult?: number;
  faction_rep_mult?: number;
  crime_money_mult?: number;
  crime_success_mult?: number;
  work_money_mult?: number;
  hacknet_node_money_mult?: number;
  hacknet_node_purchase_cost_mult?: number;
  hacknet_node_ram_cost_mult?: number;
  hacknet_node_core_cost_mult?: number;
  hacknet_node_level_cost_mult?: number;
  bladeburner_max_stamina_mult?: number;
  bladeburner_stamina_gain_mult?: number;
  bladeburner_analysis_mult?: number;
  bladeburner_success_chance_mult?: number;
  infiltration_base_rep_increase?: number;
  infiltration_rep_mult?: number;
  infiltration_trade_mult?: number;
  infiltration_sell_mult?: number;
  infiltration_timer_mult?: number;
  infiltration_damage_reduction_mult?: number;

  startingMoney?: number;
  programs?: string[];
}

function generateStatsDescription(mults: IMap<number>, programs?: string[], startingMoney?: number): JSX.Element {
  const f = (x: number, decimals = 0): string => {
    // look, I don't know how to make a "smart decimals"
    // todo, make it smarter
    if (x === 1.0777 - 1) return "7.77%";
    if (x === 1.777 - 1) return "77.7%";
    return numeralWrapper.formatPercentage(x, decimals);
  };
  let desc = <>Effects:</>;

  if (
    mults.hacking_mult &&
    mults.hacking_mult == mults.strength_mult &&
    mults.hacking_mult == mults.defense_mult &&
    mults.hacking_mult == mults.dexterity_mult &&
    mults.hacking_mult == mults.agility_mult &&
    mults.hacking_mult == mults.charisma_mult
  ) {
    desc = (
      <>
        {desc}
        <br />+{f(mults.hacking_mult - 1)} all skills
      </>
    );
  } else {
    if (mults.hacking_mult)
      desc = (
        <>
          {desc}
          <br />+{f(mults.hacking_mult - 1)} hacking skill
        </>
      );

    if (
      mults.strength_mult &&
      mults.strength_mult == mults.defense_mult &&
      mults.strength_mult == mults.dexterity_mult &&
      mults.strength_mult == mults.agility_mult
    ) {
      desc = (
        <>
          {desc}
          <br />+{f(mults.strength_mult - 1)} combat skills
        </>
      );
    } else {
      if (mults.strength_mult)
        desc = (
          <>
            {desc}
            <br />+{f(mults.strength_mult - 1)} strength skill
          </>
        );
      if (mults.defense_mult)
        desc = (
          <>
            {desc}
            <br />+{f(mults.defense_mult - 1)} defense skill
          </>
        );
      if (mults.dexterity_mult)
        desc = (
          <>
            {desc}
            <br />+{f(mults.dexterity_mult - 1)} dexterity skill
          </>
        );
      if (mults.agility_mult)
        desc = (
          <>
            {desc}
            <br />+{f(mults.agility_mult - 1)} agility skill
          </>
        );
    }
    if (mults.charisma_mult)
      desc = (
        <>
          {desc}
          <br />+{f(mults.charisma_mult - 1)} charisma skill
        </>
      );
  }

  if (
    mults.hacking_exp_mult &&
    mults.hacking_exp_mult === mults.strength_exp_mult &&
    mults.hacking_exp_mult === mults.defense_exp_mult &&
    mults.hacking_exp_mult === mults.dexterity_exp_mult &&
    mults.hacking_exp_mult === mults.agility_exp_mult &&
    mults.hacking_exp_mult === mults.charisma_exp_mult
  ) {
    desc = (
      <>
        {desc}
        <br />+{f(mults.hacking_exp_mult - 1)} exp for all skills
      </>
    );
  } else {
    if (mults.hacking_exp_mult)
      desc = (
        <>
          {desc}
          <br />+{f(mults.hacking_exp_mult - 1)} hacking exp
        </>
      );

    if (
      mults.strength_exp_mult &&
      mults.strength_exp_mult === mults.defense_exp_mult &&
      mults.strength_exp_mult === mults.dexterity_exp_mult &&
      mults.strength_exp_mult === mults.agility_exp_mult
    ) {
      desc = (
        <>
          {desc}
          <br />+{f(mults.strength_exp_mult - 1)} combat exp
        </>
      );
    } else {
      if (mults.strength_exp_mult)
        desc = (
          <>
            {desc}
            <br />+{f(mults.strength_exp_mult - 1)} strength exp
          </>
        );
      if (mults.defense_exp_mult)
        desc = (
          <>
            {desc}
            <br />+{f(mults.defense_exp_mult - 1)} defense exp
          </>
        );
      if (mults.dexterity_exp_mult)
        desc = (
          <>
            {desc}
            <br />+{f(mults.dexterity_exp_mult - 1)} dexterity exp
          </>
        );
      if (mults.agility_exp_mult)
        desc = (
          <>
            {desc}
            <br />+{f(mults.agility_exp_mult - 1)} agility exp
          </>
        );
    }
    if (mults.charisma_exp_mult)
      desc = (
        <>
          {desc}
          <br />+{f(mults.charisma_exp_mult - 1)} charisma exp
        </>
      );
  }

  if (mults.hacking_speed_mult)
    desc = (
      <>
        {desc}
        <br />+{f(mults.hacking_speed_mult - 1)} faster hack(), grow(), and weaken()
      </>
    );
  if (mults.hacking_chance_mult)
    desc = (
      <>
        {desc}
        <br />+{f(mults.hacking_chance_mult - 1)} hack() success chance
      </>
    );
  if (mults.hacking_money_mult)
    desc = (
      <>
        {desc}
        <br />+{f(mults.hacking_money_mult - 1)} hack() power
      </>
    );
  if (mults.hacking_grow_mult)
    desc = (
      <>
        {desc}
        <br />+{f(mults.hacking_grow_mult - 1)} grow() power
      </>
    );

  if (mults.faction_rep_mult && mults.faction_rep_mult === mults.company_rep_mult) {
    desc = (
      <>
        {desc}
        <br />+{f(mults.faction_rep_mult - 1)} reputation from factions and companies
      </>
    );
  } else {
    if (mults.faction_rep_mult)
      desc = (
        <>
          {desc}
          <br />+{f(mults.faction_rep_mult - 1)} reputation from factions
        </>
      );
    if (mults.company_rep_mult)
      desc = (
        <>
          {desc}
          <br />+{f(mults.company_rep_mult - 1)} reputation from companies
        </>
      );
  }

  if (mults.crime_money_mult)
    desc = (
      <>
        {desc}
        <br />+{f(mults.crime_money_mult - 1)} crime money
      </>
    );
  if (mults.crime_success_mult)
    desc = (
      <>
        {desc}
        <br />+{f(mults.crime_success_mult - 1)} crime success rate
      </>
    );
  if (mults.work_money_mult)
    desc = (
      <>
        {desc}
        <br />+{f(mults.work_money_mult - 1)} work money
      </>
    );

  if (mults.hacknet_node_money_mult)
    desc = (
      <>
        {desc}
        <br />+{f(mults.hacknet_node_money_mult - 1)} hacknet production
      </>
    );
  if (mults.hacknet_node_purchase_cost_mult)
    desc = (
      <>
        {desc}
        <br />-{f(-(mults.hacknet_node_purchase_cost_mult - 1))} hacknet nodes cost
      </>
    );
  if (mults.hacknet_node_level_cost_mult)
    desc = (
      <>
        {desc}
        <br />-{f(-(mults.hacknet_node_level_cost_mult - 1))} hacknet nodes upgrade cost
      </>
    );

  if (mults.bladeburner_max_stamina_mult)
    desc = (
      <>
        {desc}
        <br />+{f(mults.bladeburner_max_stamina_mult - 1)} Bladeburner Max Stamina
      </>
    );
  if (mults.bladeburner_stamina_gain_mult)
    desc = (
      <>
        {desc}
        <br />+{f(mults.bladeburner_stamina_gain_mult - 1)} Bladeburner Stamina gain
      </>
    );
  if (mults.bladeburner_analysis_mult)
    desc = (
      <>
        {desc}
        <br />+{f(mults.bladeburner_analysis_mult - 1)} Bladeburner Field Analysis effectiveness
      </>
    );
  if (mults.bladeburner_success_chance_mult)
    desc = (
      <>
        {desc}
        <br />+{f(mults.bladeburner_success_chance_mult - 1)} Bladeburner Contracts and Operations success chance
      </>
    );
  if (mults.infiltration_base_rep_increase)
    desc = (
      <>
        {desc}
        <br />+{f(mults.infiltration_base_rep_increase - 1)} Infiltration {FactionNames.ShadowsOfAnarchy} Reputation
        base reward
      </>
    );
  if (mults.infiltration_rep_mult)
    desc = (
      <>
        {desc}
        <br />+{f(mults.infiltration_rep_mult - 1)} Infiltration {FactionNames.ShadowsOfAnarchy} Reputation reward
      </>
    );
  if (mults.infiltration_trade_mult)
    desc = (
      <>
        {desc}
        <br />+{f(mults.infiltration_trade_mult - 1)} Infiltration Reputation for trading information
      </>
    );
  if (mults.infiltration_sell_mult)
    desc = (
      <>
        {desc}
        <br />+{f(mults.infiltration_sell_mult - 1)} Infiltration cash reward for selling information
      </>
    );
  if (mults.infiltration_timer_mult)
    desc = (
      <>
        {desc}
        <br />+{f(mults.infiltration_timer_mult - 1)} Infiltration time per minigame
      </>
    );
  if (mults.infiltration_damage_reduction_mult)
    desc = (
      <>
        {desc}
        <br />
        {f(mults.infiltration_damage_reduction_mult - 1)} Infiltration health lost per failed minigame
      </>
    );

  if (startingMoney)
    desc = (
      <>
        {desc}
        <br />
        Start with <Money money={startingMoney} /> after installing Augmentations.
      </>
    );

  if (programs)
    desc = (
      <>
        {desc}
        <br />
        Start with {programs.join(" and ")} after installing Augmentations.
      </>
    );
  return desc;
}

export class Augmentation {
  // How much money this costs to buy before multipliers
  baseCost = 0;

  // How much faction reputation is required to unlock this  before multipliers
  baseRepRequirement = 0;

  // Description of what this Aug is and what it does
  info: string | JSX.Element;

  // Description of the stats, often autogenerated, sometimes manually written.
  stats: JSX.Element | null;

  // Any Augmentation not immediately available in BitNode-1 is special (e.g. Bladeburner augs)
  isSpecial = false;

  // Name of Augmentation
  name = "";

  // Array of names of all prerequisites
  prereqs: string[] = [];

  // Multipliers given by this Augmentation.  Must match the property name in
  // The Player/Person classes
  mults: IMap<number> = {};

  // Factions that offer this aug.
  factions: string[] = [];

  constructor(
    params: IConstructorParams = {
      info: "",
      moneyCost: 0,
      name: "",
      repCost: 0,
      factions: [],
    },
  ) {
    this.name = params.name;
    this.info = params.info;
    this.prereqs = params.prereqs ? params.prereqs : [];

    this.baseRepRequirement = params.repCost;
    Object.freeze(this.baseRepRequirement);
    this.baseCost = params.moneyCost;
    Object.freeze(this.baseCost);
    this.factions = params.factions;

    if (params.isSpecial) {
      this.isSpecial = true;
    }

    // Set multipliers
    if (params.hacking_mult) {
      this.mults.hacking_mult = params.hacking_mult;
    }
    if (params.strength_mult) {
      this.mults.strength_mult = params.strength_mult;
    }
    if (params.defense_mult) {
      this.mults.defense_mult = params.defense_mult;
    }
    if (params.dexterity_mult) {
      this.mults.dexterity_mult = params.dexterity_mult;
    }
    if (params.agility_mult) {
      this.mults.agility_mult = params.agility_mult;
    }
    if (params.charisma_mult) {
      this.mults.charisma_mult = params.charisma_mult;
    }
    if (params.hacking_exp_mult) {
      this.mults.hacking_exp_mult = params.hacking_exp_mult;
    }
    if (params.strength_exp_mult) {
      this.mults.strength_exp_mult = params.strength_exp_mult;
    }
    if (params.defense_exp_mult) {
      this.mults.defense_exp_mult = params.defense_exp_mult;
    }
    if (params.dexterity_exp_mult) {
      this.mults.dexterity_exp_mult = params.dexterity_exp_mult;
    }
    if (params.agility_exp_mult) {
      this.mults.agility_exp_mult = params.agility_exp_mult;
    }
    if (params.charisma_exp_mult) {
      this.mults.charisma_exp_mult = params.charisma_exp_mult;
    }
    if (params.hacking_chance_mult) {
      this.mults.hacking_chance_mult = params.hacking_chance_mult;
    }
    if (params.hacking_speed_mult) {
      this.mults.hacking_speed_mult = params.hacking_speed_mult;
    }
    if (params.hacking_money_mult) {
      this.mults.hacking_money_mult = params.hacking_money_mult;
    }
    if (params.hacking_grow_mult) {
      this.mults.hacking_grow_mult = params.hacking_grow_mult;
    }
    if (params.company_rep_mult) {
      this.mults.company_rep_mult = params.company_rep_mult;
    }
    if (params.faction_rep_mult) {
      this.mults.faction_rep_mult = params.faction_rep_mult;
    }
    if (params.crime_money_mult) {
      this.mults.crime_money_mult = params.crime_money_mult;
    }
    if (params.crime_success_mult) {
      this.mults.crime_success_mult = params.crime_success_mult;
    }
    if (params.work_money_mult) {
      this.mults.work_money_mult = params.work_money_mult;
    }
    if (params.hacknet_node_money_mult) {
      this.mults.hacknet_node_money_mult = params.hacknet_node_money_mult;
    }
    if (params.hacknet_node_purchase_cost_mult) {
      this.mults.hacknet_node_purchase_cost_mult = params.hacknet_node_purchase_cost_mult;
    }
    if (params.hacknet_node_ram_cost_mult) {
      this.mults.hacknet_node_ram_cost_mult = params.hacknet_node_ram_cost_mult;
    }
    if (params.hacknet_node_core_cost_mult) {
      this.mults.hacknet_node_core_cost_mult = params.hacknet_node_core_cost_mult;
    }
    if (params.hacknet_node_level_cost_mult) {
      this.mults.hacknet_node_level_cost_mult = params.hacknet_node_level_cost_mult;
    }
    if (params.bladeburner_max_stamina_mult) {
      this.mults.bladeburner_max_stamina_mult = params.bladeburner_max_stamina_mult;
    }
    if (params.bladeburner_stamina_gain_mult) {
      this.mults.bladeburner_stamina_gain_mult = params.bladeburner_stamina_gain_mult;
    }
    if (params.bladeburner_analysis_mult) {
      this.mults.bladeburner_analysis_mult = params.bladeburner_analysis_mult;
    }
    if (params.bladeburner_success_chance_mult) {
      this.mults.bladeburner_success_chance_mult = params.bladeburner_success_chance_mult;
    }

    if (params.infiltration_base_rep_increase) {
      this.mults.infiltration_base_rep_increase = params.infiltration_base_rep_increase;
    }
    if (params.infiltration_rep_mult) {
      this.mults.infiltration_rep_mult = params.infiltration_rep_mult;
    }
    if (params.infiltration_trade_mult) {
      this.mults.infiltration_trade_mult = params.infiltration_trade_mult;
    }
    if (params.infiltration_sell_mult) {
      this.mults.infiltration_sell_mult = params.infiltration_sell_mult;
    }
    if (params.infiltration_timer_mult) {
      this.mults.infiltration_timer_mult = params.infiltration_timer_mult;
    }
    if (params.infiltration_damage_reduction_mult) {
      this.mults.infiltration_damage_reduction_mult = params.infiltration_damage_reduction_mult;
    }

    if (params.stats === undefined)
      this.stats = generateStatsDescription(this.mults, params.programs, params.startingMoney);
    else this.stats = params.stats;
  }

  // Adds this Augmentation to the specified Factions
  addToFactions(factionList: string[]): void {
    for (let i = 0; i < factionList.length; ++i) {
      const faction: Faction | null = Factions[factionList[i]];
      if (faction == null) {
        console.warn(`In Augmentation.addToFactions(), could not find faction with this name: ${factionList[i]}`);
        continue;
      }
      faction.augmentations.push(this.name);
    }
  }

  getCost(player: IPlayer): AugmentationCosts {
    const augmentationReference = StaticAugmentations[this.name];
    let moneyCost = augmentationReference.baseCost;
    let repCost = augmentationReference.baseRepRequirement;

    if (augmentationReference.name === AugmentationNames.NeuroFluxGovernor) {
      let nextLevel = this.getLevel(player);
      --nextLevel;
      const multiplier = Math.pow(CONSTANTS.NeuroFluxGovernorLevelMult, nextLevel);
      repCost = augmentationReference.baseRepRequirement * multiplier * BitNodeMultipliers.AugmentationRepCost;
      moneyCost = augmentationReference.baseCost * multiplier * BitNodeMultipliers.AugmentationMoneyCost;

      for (let i = 0; i < player.queuedAugmentations.length; ++i) {
        moneyCost *= getBaseAugmentationPriceMultiplier();
      }
    } else if (augmentationReference.factions.includes(FactionNames.ShadowsOfAnarchy)) {
      const soaAugmentationNames = initSoAAugmentations().map((augmentation) => augmentation.name);
      const soaMultiplier = Math.pow(
        CONSTANTS.SoACostMult,
        soaAugmentationNames.filter((augmentationName) => player.hasAugmentation(augmentationName)).length,
      );
      moneyCost = augmentationReference.baseCost * soaMultiplier;
      if (soaAugmentationNames.find((augmentationName) => augmentationName === augmentationReference.name)) {
        repCost = augmentationReference.baseRepRequirement * soaMultiplier;
      }
    } else {
      moneyCost =
        augmentationReference.baseCost *
        getGenericAugmentationPriceMultiplier() *
        BitNodeMultipliers.AugmentationMoneyCost;
    }
    return { moneyCost, repCost };
  }

  getLevel(player: IPlayer): number {
    // Get current Neuroflux level based on Player's augmentations
    if (this.name === AugmentationNames.NeuroFluxGovernor) {
      let currLevel = 0;
      for (let i = 0; i < player.augmentations.length; ++i) {
        if (player.augmentations[i].name === AugmentationNames.NeuroFluxGovernor) {
          currLevel = player.augmentations[i].level;
        }
      }

      // Account for purchased but uninstalled Augmentations
      for (let i = 0; i < player.queuedAugmentations.length; ++i) {
        if (player.queuedAugmentations[i].name == AugmentationNames.NeuroFluxGovernor) {
          ++currLevel;
        }
      }
      return currLevel + 1;
    }
    return 0;
  }

  // Adds this Augmentation to all Factions
  addToAllFactions(): void {
    for (const fac of Object.keys(Factions)) {
      if (Factions.hasOwnProperty(fac)) {
        const facObj: Faction | null = Factions[fac];
        if (facObj == null) {
          console.warn(`Invalid Faction object in addToAllFactions(). Key value: ${fac}`);
          continue;
        }
        if (facObj.getInfo().special) continue;
        facObj.augmentations.push(this.name);
      }
    }
  }

  // Serialize the current object to a JSON save state.
  toJSON(): any {
    return Generic_toJSON("Augmentation", this);
  }

  // Initiatizes a Augmentation object from a JSON save state.
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  static fromJSON(value: any): Augmentation {
    return Generic_fromJSON(Augmentation, value.data);
  }
}

Reviver.constructors.Augmentation = Augmentation;
