import { LinkTo } from '@ember/routing';

<template>
  <div id="space">
    <div id="stars">
      <div id="intro">
        Orbital velocity achieved!<br />
        Ember-router-scroll has taken you to the top of the page!<br />
        <br />
        <span class="small">
          Clicking the submarine will take you to the top of the previous page.<br
          />
          Using the back button will take you to your previous scroll position.
        </span>
      </div>

      <LinkTo @route="application"><img
          src="/images/yellow_submarine.gif"
          alt="Submarine"
          class="flip"
          id="submarine"
        /></LinkTo>
      <img src="./images/death-star.png" id="death-star" alt="Death Star" />
      <div class="depth right">
        — Orbit -500 km
      </div>
      <div class="depth right">
        — Orbit -1000 km
      </div>
      <div class="depth right">
        — Orbit -1500 km
      </div>
      <div class="depth right">
        — Orbit -2000 km
      </div>
      <div class="depth right">
        — Orbit -2500 km
      </div>
      <div class="depth right">
        — Orbit -3000 km
      </div>
      <div class="depth right">
        — Orbit -3500 km
      </div>
      <div class="depth right">
        — Orbit -4000 km
      </div>
      <div class="depth right">
        — Orbit -4500 km
      </div>
      <div class="depth right">
        — Orbit -5000 km
      </div>
    </div>
  </div>
</template>
