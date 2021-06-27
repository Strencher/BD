import {PluginUtilities} from "@zlibrary";
import pkg from "./package.json";
import Eventhandler from "./eventhandler";
import React, {useEffect} from "react";
import Utilities from "./utilities";

export default class Settings {
    static updater = new Eventhandler();

    static settings = PluginUtilities.loadSettings(pkg.info.name, {});

    static get = (key, defaultValue) => {
        return this.settings[key] ?? defaultValue;
    }

    static set = (key, value) => {
        this.settings[key] = value;
        PluginUtilities.saveSettings(pkg.info.name, this.settings);
        this.updater.reply("update");
    }

    static removeFromArray(key, item, defaultValue = []) {
        const setting = this.get(key, defaultValue);
        while (setting.indexOf(item) > -1) {
            setting.splice(setting.indexOf(item), 1);
        }
        this.set(key, setting);
        return true; 
    }

    static appendToArray(key, item, defaultValue = []) {
        const setting = this.get(key, defaultValue);
        setting.push(item);
        this.set(key, setting);
        return true;
    }

    static connectStore(Component) {
        return props => {

            if (!props.getSetting) Object.assign(props, {
                getSetting: this.get,
                updateSetting: this.set,
                toggleSetting: id => {
                    this.set(!this.get(id));
                }
            })

            const forceUpdate = Utilities.useForceUpdate();

            useEffect(() => {
                this.updater.on("update", forceUpdate);

                return () => this.updater.off("update", forceUpdate);
            }, []);

            return <Component {...props}/>;
        }
    }
}