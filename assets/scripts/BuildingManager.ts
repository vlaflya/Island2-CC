
import { _decorator, Component, Node, JsonAsset } from 'cc';
import { Building } from './Building';
import { Bridge } from './Bridge';
const { ccclass, property } = _decorator;

@ccclass('BuildingManager')
export class BuildingManager extends Component {
    @property({type: JsonAsset}) sequence: JsonAsset
    @property({type: [Building]}) buildings: Array<Building> = []
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
        this.buildings.forEach(building => {
            if(!hasSave){
                console.log(sequenceNames[this.choiceCount] + " " + building.node.name)
                building.initNoSave(building.node.name == sequenceNames[this.choiceCount])
            }
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