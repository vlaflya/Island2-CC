
import { _decorator, Component, Node, sp, loader, assetManager, Sprite, ImageAsset, SpriteFrame, resources, Prefab, tween, instantiate, Vec3, Color, UIOpacity, Button, EventTouch, Touch, UITransform, EventHandler, AudioSource, randomRangeInt, Tween, CCFloat, Vec2 } from 'cc';
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
    @property({type: Prefab}) tapParticles: Prefab
    @property({type: Prefab}) buildParticles: Prefab
    @property({type: Boolean}) horizontal = false
    @property({type: Boolean}) markerOnTop = false
    @property({type: CCFloat}) scale: number = 1
    @property({type: Vec2}) shift = new Vec2(0,0)
    private visuals: UITransform
    private Zebra: Node = null
    private zebraEndTarget: Node
    private shortPhrase: AudioSource = null
    private longPhrase: AudioSource = null
    private marker: Node = null
    private markerDefaultSize: Vec3
    private buildButton: Node = null
    private zebraStartPos: Vec3
    private startScale: Vec3 = null
    private point: BuildingPoint = null

    start(){
        this.node.getChildByName("visuals").on(Node.EventType.TOUCH_START, this.animate, this)
        this.visuals = this.node.getChildByName("visuals").getComponent(UITransform)
        this.visuals.anchorPoint = new Vec2(0.5, 0)
        this.visuals.node.position = new Vec3(this.visuals.node.position.x, this.visuals.node.position.y - this.visuals.height/2)
        if(this.visuals.node.children.length > 0){
            this.visuals.node.children.forEach(element => {
                element.position = new Vec3(element.position.x, element.position.y + this.visuals.height/2)
            });
        }
        if(this.point == null)
            return
        let name = this.node.parent.parent.name + "-" + this.point.getCount() + "-1"
        if(this.node.getChildByName(name) != null && this.point != null)
            this.shortPhrase = this.node.getChildByName(name).getComponent(AudioSource)
        name = this.node.parent.parent.name + "-" + this.point.getCount() + "-2"
        if(this.node.getChildByName(name) != null && this.point != null)
            this.longPhrase = this.node.getChildByName(name).getComponent(AudioSource)
        // this.startScale = new Vec3(this.visuals.width, this.visuals.height)
        this.startScale = new Vec3(this.visuals.node.scale)
        
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
                SoundManager.Instance.playRuin()
            }
        }
        if(this.Zebra == null){
            this.Zebra = this.node.getChildByPath("visuals/Mask/Mask/zebra")
            if(this.Zebra != null){
                this.zebraEndTarget = this.node.getChildByPath("visuals/Mask/Mask/target")
                this.zebraStartPos = new Vec3(this.Zebra.worldPosition)
            }
        }
        Tween.stopAllByTarget(this.visuals.node)
        // this.visuals.width = this.startScale.x
        // this.visuals.height = this.startScale.y
        this.visuals.node.scale = new Vec3(this.startScale)
        tween(this.visuals.node)
        .call(() => {
            let prt: Node = instantiate(this.tapParticles)
            prt.parent = this.node
            let pos = new Vec3(touch.getUILocation().x, touch.getUILocation().y, 0)
            prt.worldPosition = pos
        })
        // .by(0.1, {height: 100, width: 50}, {easing: 'bounceIn'})
        // .by(0.1, {height: -100, width: -50}, {easing: 'bounceOut'})
        .by(0.1, {scale: new Vec3(0.1,0.1,0)}, {easing: 'bounceIn'})
        .by(0.1, {scale: new Vec3(-0.1,-0.1,0)}, {easing: 'bounceOut'})
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
        if(!this.marker){
            this.marker = this.node.getChildByName("Marker")
        }
        if(isCurrentBuilding){
            this.buildButton = BuildingManager.Instance.getbutton().node
            if(this.buildButton == null)
                this.buildButton = this.node.getChildByName("Button")
            this.buildButton.active = true
            let event: EventHandler = new EventHandler()
            event.target = this.node
            event.component = "Building"
            event.handler = "setChoice"
            this.buildButton.getComponent(Button).clickEvents[0] = event
            this.buildButton.getComponent(Button).interactable = true
            this.marker.getComponent(Marker).init(true)
            this.buttonScale()   
        }
        else{
            this.marker.getComponent(Marker).hide()
        }
        if(!build)
            return
        this.fadeIn()
    }
    public setNextMarker(){
        this.buildButton = BuildingManager.Instance.getbutton().node
        this.marker = this.node.getChildByName("Marker")
        this.marker.active = true
        this.marker.getComponent(Marker).init(false)
        // this.buttonScale()
        let event: EventHandler = new EventHandler()
        event.target = this.node
        event.component = "Building"
        event.handler = "cantBuild"
        this.buildButton.getComponent(Button).clickEvents = []
        this.buildButton.getComponent(Button).clickEvents.push(event)
        this.buttonScale()
    }
    scaledButton: boolean = false
    startMarkerScale: Vec3
    private buttonScale(){
        this.buildButton.worldPosition = this.marker.worldPosition
        this.buildButton.getComponent(UITransform).width = this.marker.getComponent(UITransform).width
        this.buildButton.getComponent(UITransform).height = this.marker.getComponent(UITransform).height
        this.buildButton.scale = this.marker.scale
        this.startMarkerScale = new Vec3(this.marker.scale)
        if(this.markerOnTop && !this.scaledButton){
            this.scaledButton = true
            this.marker.setParent(ChoiceManage.Instance.node)
            this.marker.getComponent(UITransform).width = this.buildButton.getComponent(UITransform).width
            this.marker.getComponent(UITransform).height = this.buildButton.getComponent(UITransform).height
            this.marker.worldPosition = this.buildButton.worldPosition
            // this.marker.scale = new Vec3(this.buildButton.scale)
            this.marker.scale = new Vec3(this.node.scale.x * this.buildButton.scale.x, this.node.scale.y * this.buildButton.scale.y, 1)
        }
        this.markerDefaultSize = new Vec3(this.marker.scale)
    }

    public cantBuild(){
        Tween.stopAllByTarget(this.marker)
        this.marker.scale = new Vec3(this.markerDefaultSize)
        let tweenAm = this.marker.getWorldScale().x * 0.1
        tween(this.marker)
        .by(0.2, {scale: new Vec3(tweenAm,tweenAm)}, {easing: "sineIn"})
        .by(0.2, {scale: new Vec3(-tweenAm,-tweenAm)}, {easing: "sineOut"})
        .start()
        SoundManager.Instance.playUnavalible()
    }
    public fadeIn(){
        this.marker = this.node.getChildByName("Marker")
        this.node.getComponent(UIOpacity).opacity = 255
        tween(this.node.getComponent(UIOpacity))
        .to(0.5, {opacity: 255})
        .call(() => {
            ParticleManager.Instance.setParticlesAfterBuild(this.node.getChildByName("visuals").getComponent(UITransform))
        })
        .call(() => {
            SoundManager.Instance.setSound("island2_build_finish", this.node)
            BuildingManager.Instance.setNextMarker()
        })
        .delay(3)
        .call(() =>{
            if(this.shortPhrase != null)
                SoundManager.Instance.playUniqLine(this.shortPhrase)
        })
        .start()
    }
    public fadeOut(){
        SoundManager.Instance.setSound("island_construct2", this.node.parent)
        if(!this.marker){
            this.marker = this.node.getChildByName("Marker")
        }
        if(this.scaledButton){
            this.marker.setParent(this.node)
            this.marker.scale = new Vec3(0.3,0.3,0.3)
            this.marker.worldPosition = BuildingManager.Instance.buildButton.node.worldPosition
        }
        tween(this.node.getComponent(UIOpacity))
        .delay(1)
        .call(() =>{
            ParticleManager.Instance.setBuildParticles(this.node.parent.parent.children[1])
        })
        .to(1, {opacity: 0})
        .call(() =>{
            
        })
        .start()
    }
    public setChoice(){
        if(GameStateMachine.Instance.stateMachine.isCurrentState("choiseState"))
            return
        Tween.stopAllByTarget(this.marker)
        this.marker.scale = new Vec3(this.markerDefaultSize)
        let tweenAm = 0.05
        tween(this.marker)
        .by(0.2, {scale: new Vec3(tweenAm,tweenAm), worldPosition: new Vec3(0,15,0)}, {easing: "sineIn"})
        .by(0.2, {scale: new Vec3(-tweenAm,-tweenAm), worldPosition: new Vec3(0,-15,0)}, {easing: "sineOut"})
        .call(() => {
            if(GameStateMachine.Instance.stateMachine.isCurrentState("idleState"))
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
    public getShift(): Vec2{
        return this.shift
    }
}
