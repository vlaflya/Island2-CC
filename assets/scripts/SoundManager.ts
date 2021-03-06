
import { _decorator, Component, Node, AudioClip, AudioSource, assetManager, randomRangeInt, JsonAsset, UITransform, EventTouch, tween, CCFloat, Tween } from 'cc';
import { GameStateMachine } from './GameStateMachine';
import { BuildingManager } from './BuildingManager';
const { ccclass, property } = _decorator;

@ccclass('SoundManager')
export class SoundManager extends Component {
    @property({type: [AudioClip]}) clips: Array<AudioClip> = []
    @property({type: [AudioClip]}) zebraSounds: Array<AudioClip> = []
    @property({type: [AudioClip]}) canBuildVoices: Array<AudioClip> = []
    @property({type: [AudioClip]}) cantBuildVoices: Array<AudioClip> = []
    @property({type: [AudioClip]}) unavalibleClips: Array<AudioClip> = []
    @property({type: [AudioClip]}) ruinsClips: Array<AudioClip> = []
    @property({type: CCFloat}) inactiveDelay
    private currentSource: AudioSource = null
    private currentQueueCount: number = 0
    @property({type: JsonAsset}) queueAsset: JsonAsset
    private queue: Array<string> = []
    public static Instance: SoundManager
    
    onLoad(){
        SoundManager.Instance = this
        this.readQueue()
        
    }
    public startTimer(){
        tween(this)
        .delay(this.inactiveDelay)
        .call(() =>{
            this.tryPlayTutorial()
            this.startTimer()
        })
        .start()
    }
    public stopTimer(){
        Tween.stopAllByTarget(this)
    }

    private prevRandomTutor = 0
    private tryPlayTutorial(){
        if(!GameStateMachine.Instance.stateMachine.isCurrentState("idleState"))
            return
        if(this.currentSource != null){
            if(this.currentSource.playing){
                return
            }
        }
        let r = randomRangeInt(0, this.canBuildVoices.length)
        if(r == this.prevRandomTutor){
            if(r == 0)
                r++
            else
                r--
        }
        this.prevRandomTutor = r
        if(BuildingManager.Instance.getBuildFlag())
            this.trySetLine(this.canBuildVoices[r], this.node)
        else
            this.trySetLine(this.cantBuildVoices[r], this.node)
    }

    private prevRandom = 0
    public playUnavalible(){
        let r = randomRangeInt(0, this.unavalibleClips.length)
        if(r == this.prevRandom){
            if(r == 0)
                r++
            else
                r--
        }
        this.prevRandom = r
        this.trySetLine(this.unavalibleClips[r], this.node)
    }
    private prevRandomRuin = 0
    public playRuin(){
        let r = randomRangeInt(0, this.ruinsClips.length)
        if(r == this.prevRandomRuin){
            if(r == 0)
                r++
            else
                r--
        }
        this.prevRandomRuin = r
        this.trySetLine(this.ruinsClips[r], this.node)
    }

    private readQueue(){
        let read: readQueue = JSON.parse(JSON.stringify(this.queueAsset.json))
        let st = ""
        for(let c = 0; c < read.queue.length; c++){
            if(read.queue[c] == ","){
                this.queue.push(st)
                st = ""
                continue
            }
            st += read.queue[c]
        }
        this.queue.push(st)
    }

    public trySetLine(clip: AudioClip, node: Node): boolean{
        if(this.currentSource != null){
            if(this.currentSource.playing){
                return false
            }
        }
        this.setLine(clip, node)
    }

    private setLine(clip: AudioClip, node: Node){
        let source: Node = null
        source = node.getChildByName("voice")
        if(source != null){
            source.destroy()
        }
        source = new Node("voice")
        this.currentSource = source.addComponent(AudioSource)
        this.setClip(source, clip)
    }
    private zebraflag = false
    public playZebra(){
        if(!this.zebraflag){
            this.zebraflag = true
            tween(this.node)
            .delay(3)
            .call(()=>{
                this.zebraflag = false
            })
            .start()
        }
    }
    public getVoiceQueue(short: AudioSource, long: AudioSource, node: Node): boolean{
        let st = this.queue[this.currentQueueCount]
        let playeAnim: boolean = false
        if(this.currentSource != null){
            if(this.currentSource.playing){
                if(!this.zebraflag){
                    this.playZebra()
                    this.setRandomZebraSound(node)
                    return true
                }
            }
        }
        switch(st){
            case("short"):{
                this.currentSource = short
                short.play()
                this.currentQueueCount++
                break
            }
            case("long"):{
                this.currentSource = long
                long.play()
                this.currentQueueCount++
                break
            }
            case("zebra"):{
                if(!this.zebraflag){
                    this.playZebra()
                    this.setRandomZebraSound(node)
                    this.currentQueueCount++
                    playeAnim = true
                }
                break
            }
        }
        if(this.currentQueueCount == this.queue.length){
            this.currentQueueCount = 0
        }
        console.log(playeAnim);
        return playeAnim
    }
    public playUniqLine(source: AudioSource){
        if(this.currentSource != null)
            if(this.currentSource.playing)
                return
        this.currentSource = source
        source.play()
    }
    
    public setRandomZebraSound(node: Node): AudioSource{
        let source: Node = null
        source = node.getChildByName("source")
        if(source != null){
            source.destroy()
        }
        source = new Node("source")
        let r = randomRangeInt(0, this.zebraSounds.length)
        return this.setClip(source, this.zebraSounds[r])
    }
    public setSound(name: string, node: Node){
        this.clips.forEach(clip => {
            if(clip.name == name){
                let source: Node = null
                source = node.getChildByName("source")
                if(source != null){
                    source.destroy()
                }
                source = new Node("source")
                this.setClip(source, clip)
            }
        });
    }
    private setClip(node: Node, clip: AudioClip): AudioSource{
        let source =  node.getComponent(AudioSource)
        if(source == null)
            source =  node.addComponent(AudioSource)
        source.clip = clip
        source.play()
        return source
    }
}
interface readQueue{
    queue: string
}
