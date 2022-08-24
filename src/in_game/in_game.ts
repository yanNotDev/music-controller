import {
  OWGames,
  OWGamesEvents,
} from "@overwolf/overwolf-api-ts";

import { AppWindow } from "../AppWindow";
import { kWindowNames, kGamesFeatures } from "../consts";


import { OverwolfPlugin } from "./overwolfplugin";
var plugin = new OverwolfPlugin("media-plugin", true);
plugin.initialize(function (status) {
  if (status == false) {
    console.log("Plugin initialization failed");
  }
  else {
    console.log("Plugin initialized");
  }
})

class InGame extends AppWindow {
  private static _instance: InGame;
  private _gameEventsListener: OWGamesEvents;
  playing: Boolean;

  private constructor() {
    super(kWindowNames.inGame);
  }

  public static instance() {
    if (!this._instance) {
      this._instance = new InGame();
    }

    return this._instance;
  }

  public async run() {
    const gameClassId = await this.getCurrentGameClassId();

    const gameFeatures = kGamesFeatures.get(gameClassId);

    if (gameFeatures && gameFeatures.length) {
      this._gameEventsListener = new OWGamesEvents(
        {
          onInfoUpdates: this.onInfoUpdates.bind(this),
          onNewEvents: this.onNewEvents.bind(this)
        },
        gameFeatures
      );

      this._gameEventsListener.start();
    }
  }

  private onNewEvents(event) {
    if (event['events'][0]['name'] === 'death') {
      plugin.get().playpause((data) => console.log(data));
      this.playing = true;
    }
  }

  private onInfoUpdates(info) {
    let phase = info["match_info"]["round_phase"]
    if ((phase === 'shopping' && !this.playing) || phase === 'combat') {
      plugin.get().playpause((data) => console.log(data));
    }
  }


  private async getCurrentGameClassId(): Promise<number | null> {
    const info = await OWGames.getRunningGameInfo();

    return (info && info.isRunning && info.classId) ? info.classId : null;
  }
}

InGame.instance().run();
