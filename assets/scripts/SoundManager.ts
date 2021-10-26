
import { _decorator, Component, Node, AudioClip, AudioSource, assetManager, randomRangeInt } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('SoundManager')
export class SoundManager extends Component {
    @property({type: [AudioClip]}) clips: Array<AudioClip> = []
    @property({type: AudioClip}) 
    public static Instance: SoundManager
    onLoad(){
        SoundManager.Instance = this
        let r = randomRangeInt(0, 2)
        this.setSound("island2_hello_" + r, this.node)
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
    private setClip(node: Node, clip: AudioClip){
        let source =  node.addComponent(AudioSource)
        source.clip = clip
        source.play()
    }
}
