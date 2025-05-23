import { LinkTo } from '@ember/routing';

<template>
  <div id="ocean">
    <div id="nav">
      Nav Bar
    </div>
    <div id="target-main">
      <div id="intro">
        Click on the submarine to launch!
      </div>
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
  </div>
  <LinkTo @route="target-next-page"><img
      src="/images/yellow_submarine.gif"
      alt="Submarine"
      id="submarine"
    /></LinkTo>
</template>
