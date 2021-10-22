
import { _decorator, Component, Node, Sprite, assetManager, SpriteFrame, builtinResMgr, path, instantiate, Vec3, AudioClip, AudioSource, tween, AssetManager, Prefab, UITransform, Vec2 } from 'cc';
import { Building } from './Building';
import { GameStateMachine } from './GameStateMachine';
import { BuildingManager } from './BuildingManager';
import { BuildingPoint } from './BuildingPoint';
import { SoundManager } from './SoundManager';
const { ccclass, property } = _decorator;

@ccclass('ChoiceManage')
export class ChoiceManage extends Component {
    public static Instance: ChoiceManage
    @property({type: Node}) selectWindow: Node
    @property({type: UITransform}) option1: UITransform
    @property({type: UITransform}) option2: UITransform

    private currentPoint: BuildingPoint
    private optionCount: number = 0
    private bundle
    
    onLoad(){
        ChoiceManage.Instance = this
    }
    public createChoice(name: string, building: BuildingPoint){
        if(!GameStateMachine.Instance.stateMachine.isCurrentState("idleState"))
            return
        GameStateMachine.Instance.exitIdle("choiseState")
        SoundManager.Instance.setSound("island_marker", this.node)
        this.currentPoint = building
        this.selectWindow.active = true
    }
    public preload(name: string,  optionCount: number){
        this.optionCount = optionCount
        assetManager.loadBundle('Buildings', (err, load) => {
            this.bundle = load
            let st: string = name + "-" + this.optionCount + "-1"
            if(this.option1.node.children.length > 0)
                this.option1.node.children[0].destroy()
            this.loadPrefab(st, this.option1.node)
            st = name + "-" + this.optionCount + "-2"
            if(this.option2.node.children.length > 0)
                this.option2.node.children[0].destroy()
            this.loadPrefab(st, this.option2.node)
        });
    }
    private  loadPrefab(st: string, parent: Node){
        console.log(st);
        this.bundle.load(st, (err, asset) =>{
            console.log(asset);
            let building: Node = instantiate(asset)
            building.parent = parent
            building.position = new Vec3(0,0,0)
            building.getComponent(Building).init(false, this.currentPoint)
            building.scale = new Vec3(1,1,1)
            let transform = building.getChildByName("visuals").getComponent(UITransform)
            let ratio = transform.width / transform.height
            let vec: Vec2 = new Vec2(parent.getComponent(UITransform).width)
            transform.node.position = new Vec3(0,0,0)
            vec.y = vec.x / ratio
            transform.width = vec.x
            transform.height = vec.y
        })
    }
    public makeChoice1(){
        this.sendChoice("-1")
    }
    public makeChoice2(){
        this.sendChoice("-2")
    }
    private sendChoice(option: string){
        tween(this)
        .call(() => {
            SoundManager.Instance.setSound("island_selectskin", this.node)
        })
        .delay(0.5)
        .call(() => {
            SoundManager.Instance.setSound("island_close", this.node)
        })
        .start()
        this.selectWindow.active = false
        let st = this.optionCount + option
        this.currentPoint.build(st)
        BuildingManager.Instance.madeChoise()
        GameStateMachine.Instance.madeChoise()
    }
}
