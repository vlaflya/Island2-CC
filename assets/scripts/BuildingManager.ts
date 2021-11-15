
import { _decorator, Component, Node, JsonAsset, assetManager, Prefab, path, Button, randomRangeInt, AudioClip, tween } from 'cc';
import { Building } from './Building';
import { Bridge } from './Bridge';
import { BuildingPoint } from './BuildingPoint';
import { ChoiceManage } from './ChoiceManage';
import { SoundManager } from './SoundManager';
const { ccclass, property } = _decorator;

@ccclass('BuildingManager')
export class BuildingManager extends Component {
    @property({type: JsonAsset}) sequence: JsonAsset
    @property({type: JsonAsset}) afterSequence: JsonAsset
    @property({type: Button}) buildButton: Button
    @property({type: [BuildingPoint]}) buildingPoints: Array<BuildingPoint> = []
    @property({type: Node}) tutorialPointer: Node
    @property({type: AudioClip}) tutor1: AudioClip
    @property({type: AudioClip}) tutor2: AudioClip
    @property({type: AudioClip}) startPharase1: AudioClip
    @property({type: AudioClip}) startPharase2: AudioClip
    
    private canBuild: boolean = true
    private choiceCount: number = 0
    private sequenceLength: number = 0
    private lastDate: string = ""
    public static Instance: BuildingManager
    private sequenceNames: Array<String> = []

    onLoad(){
        BuildingManager.Instance = this
        // this.tutorialPointer.active = false
    }
    public getbutton(): Button{
        return this.buildButton
    }
    public init(save: JsonAsset = null){
        console.log("oke")
        let hasSave: boolean
        if(save == null){
            hasSave = false
            this.canBuild = true
        }
        else{
            hasSave = true
        }
        this.readJson(this.sequence)
        if(this.choiceCount >= this.sequenceNames.length){
            this.sequenceLength = this.sequenceNames.length
            this.readJson(this.afterSequence)
            this.afterBuild(hasSave)
        }
        else{
            console.log(this.choiceCount + " " + this.sequenceNames.length);
            this.normalBuild(hasSave)
        }
        if(this.choiceCount == 0){
            tween(this)
            .call(() => {
                SoundManager.Instance.trySetLine(this.tutor1, this.node)
            })
            .delay(7)
            .call(() => {
                this.tutorialPointer.active = true
                SoundManager.Instance.trySetLine(this.tutor2, this.node)
            })
            .start()
        }
        else{
            this.tutorialPointer.active = false
            let r = randomRangeInt(0, 2)
            switch(r){
                case (0):{
                    SoundManager.Instance.trySetLine(this.startPharase1, this.node)
                    break
                }
                case (1):{
                    SoundManager.Instance.trySetLine(this.startPharase2, this.node)
                    break
                }
            }
        }
    }

    private readJson(asset: JsonAsset){
        let read: readBuildings = JSON.parse(JSON.stringify(asset.json))
        this.sequenceNames = []
        let st: string = ""
        if(this.sequenceNames.length == 0){
            for(let c = 0; c < read.sequence.length; c++){
                if(read.sequence[c] == ","){
                    this.sequenceNames.push(st)
                    st = ""
                    continue
                }
                st += read.sequence[c]
            }
            this.sequenceNames.push(st)
        }
    }

    private afterBuild(hasSave: boolean){
        console.log("after")
        this.buildingPoints.forEach(point => {
            if(!hasSave)
                point.init("0-1",point.node.name == this.sequenceNames[this.choiceCount - this.sequenceLength])
            if(point.node.name == this.sequenceNames[this.choiceCount - this.sequenceLength]){
                ChoiceManage.Instance.preload(point.node.name, point.getCount(), point, true, point.getMaxBuildCount())
            }
        });
    }
    private normalBuild(hasSave: boolean){
        this.buildingPoints.forEach(point => {
            if(!hasSave)
                point.init("0-1",point.node.name == this.sequenceNames[this.choiceCount])
            if(point.node.name == this.sequenceNames[this.choiceCount]){
                ChoiceManage.Instance.preload(point.node.name, point.getCount() + 1, point)
            }
        });
    }
    public hidePointer(){
        if(this.tutorialPointer.active)
            this.tutorialPointer.active = false
    }
    public madeChoise(){
        var today = new Date();
        this.canBuild = false
        this.lastDate = today.toString()
        this.choiceCount++
        if(this.choiceCount == this.sequenceLength + this.sequenceNames.length && this.sequenceLength != 0)
            this.choiceCount = this.sequenceLength
    }
    public setNextMarker(){
        let markerIndex = this.choiceCount
        if(this.sequenceLength != 0)
            markerIndex -= this.sequenceLength
        this.buildingPoints.forEach(point => {
            if(point.node.name == this.sequenceNames[markerIndex])
                point.setNextMarker()
        });
    }
    public getBuildFlag(): boolean{
        return this.canBuild
    }
}
interface readBuildings{
    sequence: string
}