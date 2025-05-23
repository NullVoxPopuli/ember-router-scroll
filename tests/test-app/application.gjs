import { LinkTo } from '@ember/routing';
import { hash } from '@ember/helper';

const not = (x) => !x;

<template>
  <div id="ocean">
    <div id="intro">
      Click on the submarine to launch!
    </div>

    <LinkTo
      @route="application"
      @query={{hash small=(not @controller.small) preserveScrollPosition=true}}
      id="change-size"
    >
      Click here to change the size of the submarine
    </LinkTo>

    <LinkTo @route="next-page">
      <img
        src="/images/yellow_submarine.gif"
        alt="Submarine"
        id="submarine"
        class={{if @controller.small "small"}}
      />
    </LinkTo>

    <div class="depth left">
      — 500 fathoms
    </div>
    <div class="depth left">
      — 1000 fathoms
    </div>
    <div class="depth left">
      — 1500 fathoms
    </div>
    <div class="depth left">
      — 2000 fathoms
    </div>
    <div class="depth left">
      — 2500 fathoms
    </div>
    <div class="depth left">
      — 3000 fathoms
    </div>
    <div class="depth left">
      — 3500 fathoms
    </div>
    <div class="depth left">
      — 4000 fathoms
    </div>
    <div class="depth left">
      — 4500 fathoms
    </div>
    <div class="depth left">
      — 5000 fathoms
    </div>
    <img src="/images/tentacle-monster.png" alt="Monster" id="monster" />
  </div>
  {{outlet}}
</template>
