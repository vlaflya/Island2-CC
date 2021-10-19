
import { _decorator, Component, Node, JsonAsset, assetManager, Prefab, path } from 'cc';
import { Building } from './Building';
import { Bridge } from './Bridge';
import { BuildingPoint } from './BuildingPoint';
const { ccclass, property } = _decorator;

@ccclass('BuildingManager')
export class BuildingManager extends Component {
    @property({type: JsonAsset}) sequence: JsonAsset
    @property({type: [BuildingPoint]}) buildingPoints: Array<BuildingPoint> = []
    private choiceCount: number = 0
    private lastDate: string = ""
    public static Instance: BuildingManager

    onLoad(){
        BuildingManager.Instance = this
    }

    public init(save: JsonAsset = null){
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
        let sequenceNames: Array<String> = []
        let st: string = ""
        for(let c = 0; c < read.sequence.length; c++){
            if(read.sequence[c] == ","){
                sequenceNames.push(st)
                st = ""
                continue
            }
            st += read.sequence[c]
        }
        this.buildingPoints.forEach(point => {
            if(!hasSave)
                point.init("0-1",point.node.name == sequenceNames[this.choiceCount])
        });
    }
    public madeChoise(){
        var today = new Date();
        this.lastDate = today.toString()
        this.choiceCount++
    }
}
interface readBuildings{
    sequence: string
}