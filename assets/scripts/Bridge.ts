
import { _decorator, Component, Node, JsonAsset, director } from 'cc';
import { GameStateMachine } from './GameStateMachine';
const { ccclass, property } = _decorator;

@ccclass('Bridge')
export class Bridge extends Component {
    @property({type: Node}) nextDayButton: Node
    @property({type: Node}) resetButton: Node

    private saveInfo: JsonAsset = null
    public static Instance: Bridge
    onLoad(){
        Bridge.Instance = this
    }
    public loadSave(){
        GameStateMachine.Instance.saveLoadded(this.saveInfo)
    }
    public reload(){
        director.loadScene("scene")
    }
    public save(){
        
    }
}
