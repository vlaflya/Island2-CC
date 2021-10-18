
import { _decorator, Component, Node, Sprite, assetManager, SpriteFrame, builtinResMgr, path } from 'cc';
import { Building } from './Building';
import { GameStateMachine } from './GameStateMachine';
import { BuildingManager } from './BuildingManager';
const { ccclass, property } = _decorator;

@ccclass('ChoiceManage')
export class ChoiceManage extends Component {
    public static Instance: ChoiceManage
    @property({type: Node}) selectWindow: Node
    @property({type: Sprite}) option1: Sprite
    @property({type: Sprite}) option2: Sprite
    private currentBuilding: Building
    private optionCount: number
    
    onLoad(){
        ChoiceManage.Instance = this
    }
    public createChoice(name: string, optionCount: number, building: Building){
        if(!GameStateMachine.Instance.stateMachine.isCurrentState("idleState"))
            return
        GameStateMachine.Instance.exitIdle("choiseState")
        this.currentBuilding = building
        this.optionCount = optionCount
        let bundle
        assetManager.loadBundle('Buildings', (err, load) => {
            bundle = load
            console.log(err);
            let path = name + "-" + optionCount + "-1" + "/spriteFrame"
            bundle.load(path, SpriteFrame, (err, asset) =>{
                this.option1.spriteFrame = asset
                console.log(err);
            })
            path = name + "-" + optionCount + "-2" + "/spriteFrame"
            bundle.load(path, SpriteFrame, (err, asset) =>{
                this.option2.spriteFrame = asset
                console.log(err);
            })
            this.selectWindow.active = true
        });
    }
    public makeChoice1(){
        this.sendChoice("-1")
    }
    public makeChoice2(){
        this.sendChoice("-2")
    }
    private sendChoice(option: string){
        this.selectWindow.active = false
        let st = this.optionCount + option
        this.currentBuilding.init(st, false)
        BuildingManager.Instance.madeChoise()
        GameStateMachine.Instance.madeChoise()
    }
}
