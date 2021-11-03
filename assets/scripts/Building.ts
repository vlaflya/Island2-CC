
import { _decorator, Component, Node, sp, loader, assetManager, Sprite, ImageAsset, SpriteFrame, resources, Prefab, tween, instantiate, Vec3, Color, UIOpacity, Button, EventTouch, Touch, UITransform, EventHandler, AudioSource, randomRangeInt, Tween, CCFloat } from 'cc';
import { GameStateMachine } from './GameStateMachine';
import { ChoiceManage } from './ChoiceManage';
import { BuildingPoint } from './BuildingPoint';
import { BuildingManager } from './BuildingManager';
import { ParticleManager } from './ParticleManager';
import { SoundManager } from './SoundManager';
import { Marker } from './Marker';
const { ccclass, property } = _decorator;

@ccclass('Building')
export class Building extends Component {
    @property({type: Boolean}) interactable: boolean = true
    private buildButton: Node = null
    @property({type: Prefab}) tapParticles: Prefab
    @property({type: Prefab}) buildParticles: Prefab
    @property({type: Boolean}) horizontal = false
    @property({type: CCFloat}) scale: number = 1
    private Zebra: Node = null
    private zebraEndTarget: Node
    private shortPhrase: AudioSource = null
    private longPhrase: AudioSource = null
    
    
    private zebraStartPos: Vec3
    private startScale: Vec3 = null
    private point: BuildingPoint = null

    start(){
        this.node.getChildByName("visuals").on(Node.EventType.TOUCH_START, this.animate, this)
        if(this.point == null)
            return
        let name = this.node.parent.parent.name + "-" + this.point.getCount() + "-1"
        if(this.node.getChildByName(name) != null && this.point != null)
            this.shortPhrase = this.node.getChildByName(name).getComponent(AudioSource)
        else
            console.log(name);
        name = this.node.parent.parent.name + "-" + this.point.getCount() + "-2"
        if(this.node.getChildByName(name) != null && this.point != null)
            this.longPhrase = this.node.getChildByName(name).getComponent(AudioSource)
        this.startScale = new Vec3(this.node.scale)
        
    }

    private animate(touch: Touch, event: EventTouch){
        if(!this.interactable)
            return
        if(!GameStateMachine.Instance.stateMachine.isCurrentState("idleState") && !GameStateMachine.Instance.stateMachine.isCurrentState("animationState"))
            return
        let playAnimation: boolean = false
        if(GameStateMachine.Instance.stateMachine.isCurrentState("idleState")){
            GameStateMachine.Instance.stateMachine.exitState("animationState")
            if(this.shortPhrase != null && this.longPhrase != null){
                playAnimation = SoundManager.Instance.getVoiceQueue(this.shortPhrase, this.longPhrase, this.node)
            }
            if(this.point.getCount() == 0){
                let r = randomRangeInt(0, 3)
                SoundManager.Instance.setSound("island2_ruin_" + r, this.node)
            }
        }
        if(this.Zebra == null){
            this.Zebra = this.node.getChildByPath("visuals/Mask/Mask/zebra")
            if(this.Zebra != null){
                this.zebraEndTarget = this.node.getChildByPath("visuals/Mask/Mask/target")
                this.zebraStartPos = new Vec3(this.Zebra.worldPosition)
            }
        }
        Tween.stopAllByTarget(this.node)
        this.node.scale = this.startScale
        tween(this.node)
        .call(() => {
            let prt: Node = instantiate(this.tapParticles)
            prt.parent = this.node
            let pos = new Vec3(touch.getUILocation().x, touch.getUILocation().y, 0)
            prt.worldPosition = pos
        })
        .by(0.1, {scale: new Vec3(-0.05, -0.05, -0.07)}, {easing: 'bounceIn'})
        .by(0.1, {scale: new Vec3(0.05, 0.05, 0.07)}, {easing: 'bounceOut'})
        .call(() => {
            if(this.Zebra != null && playAnimation && !this.animating){
                this.animateZebra(true)
            }
            else{
                GameStateMachine.Instance.stateMachine.exitState()
            }
        })
        .start()
    }

    animating: boolean = false
    animateZebra(canExit: boolean){
        this.animating = true
        //this.Zebra.scale = new Vec3(0,0,0)
        let anim: sp.Skeleton = this.Zebra.getComponent(sp.Skeleton)
        if(!this.horizontal)
            anim.setAnimation(0, "Happy", false)
        else
            anim.setAnimation(0, "Happy2", false)
        this.Zebra.getComponent(sp.Skeleton).setEventListener((x, ev) => {this.listner(x, ev)})
        tween(this.Zebra)
        .to(0.5, {worldPosition: this.zebraEndTarget.worldPosition})
        .delay(2)
        .to(0.5, {worldPosition: this.zebraStartPos})
        .call(() => {
            if(canExit)
                GameStateMachine.Instance.stateMachine.exitState()
            this.animating = false
            })
        .start()
    }

    private listner(x, ev){
        if(ev.data.name == "peak"){
            console.log("peak")
        }
    }

    public init(isCurrentBuilding: boolean, point: BuildingPoint, build: boolean = false){
        this.point = point
        // this.buildButton = this.node.getChildByName("Marker")
        
        
        if(isCurrentBuilding){
            this.buildButton = BuildingManager.Instance.getbutton().node
            if(this.buildButton == null)
                this.buildButton = this.node.getChildByName("Button")
            this.buildButton.worldPosition = this.node.getChildByName("Marker").worldPosition
            this.buildButton.active = true
            let event: EventHandler = new EventHandler()
            event.target = this.node
            event.component = "Building"
            event.handler = "setChoice"
            this.buildButton.getComponent(Button).clickEvents.push(event)
            this.buildButton.getComponent(Button).interactable = true
            this.node.getChildByName("Marker").getComponent(Marker).init(true)
            // console.log(this.buildButton.getComponent(Button).clickEvents.length);
            // this.buildButton.on(Node.EventType.TOUCH_START, this.setChoice, this)
        }
        else{
            // if(this.buildButton != null)
            //     this.buildButton.active = false
        }
            
        if(!build)
            return
        this.fadeIn()
    }
    public setNextMarker(){
        this.buildButton = BuildingManager.Instance.getbutton().node
        this.buildButton.worldPosition = this.node.getChildByName("Marker").worldPosition
        this.node.getChildByName("Marker").active = true
        this.node.getChildByName("Marker").getComponent(Marker).init(false)
        let event: EventHandler = new EventHandler()
        event.target = this.node
        event.component = "Building"
        event.handler = "cantBuild"
        this.buildButton.getComponent(Button).clickEvents = []
        this.buildButton.getComponent(Button).clickEvents.push(event)
    }
    public cantBuild(){
        SoundManager.Instance.playUnavalible()
    }
    public fadeIn(){
        this.node.getComponent(UIOpacity).opacity = 255
        
        tween(this.node.getComponent(UIOpacity))
        .to(1, {opacity: 255})
        .call(() => {
            ParticleManager.Instance.setParticlesAfterBuild(this.node.getChildByName("visuals").getComponent(UITransform))
            SoundManager.Instance.setSound("island2_build_finish", this.node)
            
        })
        .delay(3)
        .call(() =>{
            if(this.shortPhrase != null)
                SoundManager.Instance.playUniqLine(this.shortPhrase)
        })
        .delay(1)
        .call(() =>{
            BuildingManager.Instance.setNextMarker()
        })
        .start()
    }
    public fadeOut(){
        SoundManager.Instance.setSound("island_construct2", this.node.parent)
        // let prt: Node = instantiate(this.buildParticles)
        // prt.parent = this.node.parent.parent.children[1]
        // console.log(prt.parent.name)
        // prt.position = new Vec3(0,0,0)
        ParticleManager.Instance.setBuildParticles(this.node.parent.parent.children[1])
        tween(this.node.getComponent(UIOpacity))
        .to(1, {opacity: 0})
        .start()
    }
    public setChoice(){
        if(!GameStateMachine.Instance.stateMachine.isCurrentState("idleState"))
            return
        tween(this.node.getChildByName("Marker"))
        .by(0.2, {scale: new Vec3(0.1,0.1)}, {easing: 'bounceOut'})
        .by(0.2, {scale: new Vec3(-0.1,-0.1)}, {easing: 'bounceOut'})
        .call(() => {
            this.point.setChoice()
        })
        .start()
    }
    public startBuild(){
        if(GameStateMachine.Instance.stateMachine.isCurrentState("idle")){
            GameStateMachine.Instance.exitIdle("choise")
        }
    }
    public getScale(): number{
        return this.scale
    }
}
