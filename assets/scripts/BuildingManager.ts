
import { _decorator, Component, Node, JsonAsset, assetManager, Prefab, path, Button } from 'cc';
import { Building } from './Building';
import { Bridge } from './Bridge';
import { BuildingPoint } from './BuildingPoint';
import { ChoiceManage } from './ChoiceManage';
const { ccclass, property } = _decorator;

@ccclass('BuildingManager')
export class BuildingManager extends Component {
    @property({type: JsonAsset}) sequence: JsonAsset
    @property({type: Button}) buildButton: Button
    @property({type: [BuildingPoint]}) buildingPoints: Array<BuildingPoint> = []
    private choiceCount: number = 0
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

        let read: readBuildings = JSON.parse(JSON.stringify(this.sequence.json))
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
        if(this.choiceCount == this.sequenceNames.length)
            return
        console.log(this.sequenceNames[this.choiceCount])
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
    }
    public setNextMarker(){
        if(this.choiceCount == this.sequenceNames.length)
            return
        this.buildingPoints.forEach(point => {
            if(point.node.name == this.sequenceNames[this.choiceCount])
                point.setNextMarker()
        });
    }
    
}
interface readBuildings{
    sequence: string
}