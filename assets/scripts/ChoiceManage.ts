
import { _decorator, Component, Node, Sprite, assetManager, SpriteFrame, builtinResMgr, path, instantiate, Vec3 } from 'cc';
import { Building } from './Building';
import { GameStateMachine } from './GameStateMachine';
import { BuildingManager } from './BuildingManager';
import { BuildingPoint } from './BuildingPoint';
const { ccclass, property } = _decorator;

@ccclass('ChoiceManage')
export class ChoiceManage extends Component {
    public static Instance: ChoiceManage
    @property({type: Node}) selectWindow: Node
    @property({type: Sprite}) option1: Sprite
    @property({type: Sprite}) option2: Sprite
    private currentPoint: BuildingPoint
    private optionCount: number
    
    onLoad(){
        ChoiceManage.Instance = this
    }
    public createChoice(name: string, optionCount: number, building: BuildingPoint){
        if(!GameStateMachine.Instance.stateMachine.isCurrentState("idleState"))
            return
        GameStateMachine.Instance.exitIdle("choiseState")
        this.selectWindow.active = true
        this.currentPoint = building
        this.optionCount = optionCount
        let bundle
        let st: string = name + "-" + this.optionCount + "-1"
        assetManager.loadBundle('Buildings', (err, load) => {
            bundle = load
            bundle.load(st, (err, asset) =>{
                let building: Node = instantiate(asset)
                building.parent = this.option1.node
                //building.position = new Vec3(0,0,0)
                building.getComponent(Building).init(false, this.currentPoint)
            })

            st = name + "-" + this.optionCount + "-2"
            bundle.load(st, (err, asset) =>{
                let building: Node = instantiate(asset)
                building.parent = this.option2.node
                building.position = new Vec3(0,0,0)
                building.getComponent(Building).init(false, this.currentPoint)
            })
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
        this.currentPoint.build(st, false)
        BuildingManager.Instance.madeChoise()
        GameStateMachine.Instance.madeChoise()
    }
}
