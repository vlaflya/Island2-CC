
import { _decorator, Component, Node, Sprite, assetManager, SpriteFrame, builtinResMgr, path, instantiate, Vec3, AudioClip, AudioSource, tween, AssetManager, Prefab, UITransform, Vec2, sp, randomRangeInt } from 'cc';
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
    @property({type: sp.Skeleton}) paperL: sp.Skeleton
    @property({type: sp.Skeleton}) paperR: sp.Skeleton
    @property({type: sp.Skeleton}) zebra: sp.Skeleton

    private currentPoint: BuildingPoint
    private optionCount: number = 0
    private bundle
    private choosePhase: boolean = false
    
    onLoad(){
        ChoiceManage.Instance = this
        this.zebra.timeScale = 0
        this.paperL.timeScale = 0
        this.paperR.timeScale = 0
        this.zebra.setMix("2-Idle-v2", "3-Choice", 0.5)
    }
    public createChoice(name: string, building: BuildingPoint){
        if(!GameStateMachine.Instance.stateMachine.isCurrentState("idleState"))
            return
        GameStateMachine.Instance.exitIdle("choiseState")
        SoundManager.Instance.setSound("island_marker", this.node)
        this.choosePhase = true
        this.currentPoint = building
        this.paperL.setAnimation(0, "1-Start", false)
        this.paperL.addAnimation(0, "2-Idle", true)
        this.paperL.timeScale = 1
        this.paperL.setEventListener((x, ev) => {this.listner(x, ev)})
        let r = randomRangeInt(0,3)
        SoundManager.Instance.setSound("island2_marker_can_build_" + r, this.node)
    }

    listner(x, ev){
        console.log(ev.data.name);
        if(ev.data.name == "delay-paper-start"){
            this.paperR.setAnimation(0, "1-Start", false)
            this.paperR.addAnimation(0, "2-Idle", true)
            this.paperR.timeScale = 1
        }
        if(ev.data.name == "delay-zebra-start"){
            this.zebra.setAnimation(0, "1-Start", false)
            this.zebra.addAnimation(0, "2-Idle-v2", true)
            this.zebra.timeScale = 1
        }
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
            if(building.getChildByName("visuals").getChildByName("Mask") != null)
                building.getChildByName("visuals").getChildByName("Mask").active = false
        })
    }
    public makeChoice1(){
        if(!this.choosePhase)
            return
        this.choosePhase = false
        this.sendChoice("-1")
        this.paperL.setAnimation(0, "4-Choice", false)
        this.paperR.setAnimation(0, "3-Down", false)
    }
    public makeChoice2(){
        if(!this.choosePhase)
            return
        this.choosePhase = false
        this.sendChoice("-2")
        this.paperR.setAnimation(0, "4-Choice", false)
        this.paperL.setAnimation(0, "3-Down", false)
    }
    private sendChoice(option: string){
        let r = randomRangeInt(0, 2)
        SoundManager.Instance.setSound("island2_choice_" + r, this.node)
        this.zebra.setAnimation(0, "3-Choice", false)
        this.zebra.addAnimation(0, "4-Out", false)
        // BuildingManager.Instance.buildButton.node.worldPosition = new Vec3(-1000, -1000)
        tween(this)
        .call(() => {
            SoundManager.Instance.setSound("island_selectskin", this.node)
        })
        .delay(0.5)
        .call(() => {
            SoundManager.Instance.setSound("island_close", this.node)
            //this.selectWindow.active = false
            let st = this.optionCount + option
            this.currentPoint.build(st)
            BuildingManager.Instance.madeChoise()
            GameStateMachine.Instance.madeChoise()
        })
        .start()
    }
}
