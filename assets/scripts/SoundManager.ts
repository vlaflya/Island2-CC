
import { _decorator, Component, Node, AudioClip, AudioSource } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('SoundManager')
export class SoundManager extends Component {
    @property({type: [AudioClip]}) clips: Array<AudioClip> = []
    public static Instance: SoundManager
    onLoad(){
        SoundManager.Instance = this
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
