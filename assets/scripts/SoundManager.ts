
import { _decorator, Component, Node, AudioClip, AudioSource, assetManager, randomRangeInt, JsonAsset } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('SoundManager')
export class SoundManager extends Component {
    @property({type: [AudioClip]}) clips: Array<AudioClip> = []
    @property({type: AudioClip}) zebraSounds: Array<AudioClip> = []

    private currentSource: AudioSource = null
    private currentQueueCount: number = 0
    @property({type: JsonAsset}) queueAsset: JsonAsset
    private queue: Array<string> = []
    public static Instance: SoundManager
    
    onLoad(){
        SoundManager.Instance = this
        let r = randomRangeInt(0, 2)
        this.setSound("island2_hello_" + r, this.node)
        this.readQueue()
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
        this.queue.forEach(element => {
            console.log(element);
        });
    }

    public trySetLine(clip: AudioClip, node: Node): boolean{
        if(this.currentSource != null){
            if(this.currentSource.playing){
                return false
            }
            this.setLine(clip, node)
        }
        this.setLine(clip, node)
    }
    
    public getVoiceQueue(short: AudioSource, long: AudioSource, node: Node): boolean{
        let st = this.queue[this.currentQueueCount]
        let playeAnim: boolean = false
        if(this.currentSource != null){
            if(this.currentSource.playing){
                return true
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
                this.currentSource = this.setRandomZebraSound(node)
                this.currentQueueCount++
                playeAnim = true
                break
            }
        }
        if(this.currentQueueCount == this.queue.length){
            this.currentQueueCount = 0
        }
        return playeAnim
    }
    public playUniqLine(source: AudioSource){
        if(this.currentSource != null)
            if(this.currentSource.playing)
                return
        this.currentSource = source
        source.play()
    }
    private setLine(clip: AudioClip, node: Node){
        let source: Node = null
        source = node.getChildByName("voice")
        if(source != null){
            source.destroy()
        }
        source = new Node("voice")
        this.setClip(source, clip)
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
        let source =  node.addComponent(AudioSource)
        source.clip = clip
        source.play()
        return source
    }
}
interface readQueue{
    queue: string
}
