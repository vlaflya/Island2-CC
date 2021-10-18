
import { _decorator, Component, Node, JsonAsset } from 'cc';
import { GameStateMachine } from './GameStateMachine';
const { ccclass, property } = _decorator;

@ccclass('Bridge')
export class Bridge extends Component {
    @property({type: Node}) nextDayButton: Node
    private saveInfo: JsonAsset = null
    public static Instance: Bridge
    onLoad(){
        Bridge.Instance = this
    }
    public loadSave(){
        GameStateMachine.Instance.saveLoadded(this.saveInfo)
    }
}
