
import { _decorator, Component, Node, JsonAsset, assetManager, Prefab, path, Button } from 'cc';
import { Building } from './Building';
import { Bridge } from './Bridge';
import { BuildingPoint } from './BuildingPoint';
import { ChoiceManage } from './ChoiceManage';
const { ccclass, property } = _decorator;

@ccclass('BuildingManager')
export class BuildingManager extends Component {
    @property({type: JsonAsset}) sequence: JsonAsset
    @property({type: JsonAsset}) afterSequence: JsonAsset
    @property({type: Button}) buildButton: Button
    @property({type: [BuildingPoint]}) buildingPoints: Array<BuildingPoint> = []
    private choiceCount: number = 0
    private sequenceLength: number = 0
    private lastDate: string = ""
    public static Instance: BuildingManager
    private sequenceNames: Array<String> = []

    onLoad(){
        BuildingManager.Instance = this
    }
    public getbutton(): Button{
        return this.buildButton
    }
    public init(save: JsonAsset = null){
        console.log("oke")
        let hasSave: boolean
        let newDay: boolean = true
        if(save == null){
            hasSave = false
            newDay = true
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
                ChoiceManage.Instance.preload(point.node.name, point.getCount(), true, point.getMaxBuildCount())
            }
        });
    }
    private normalBuild(hasSave: boolean){
        this.buildingPoints.forEach(point => {
            if(!hasSave)
                point.init("0-1",point.node.name == this.sequenceNames[this.choiceCount])
            if(point.node.name == this.sequenceNames[this.choiceCount]){
                ChoiceManage.Instance.preload(point.node.name, point.getCount() + 1)
            }
        });
    }
    public madeChoise(){
        var today = new Date();
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
    
}
interface readBuildings{
    sequence: string
}