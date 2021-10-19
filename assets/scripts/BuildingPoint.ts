
import { _decorator, Component, Node, assetManager, instantiate, Vec3, tween, UIOpacity } from 'cc';
import { Building } from './Building';
import { ChoiceManage } from './ChoiceManage';
const { ccclass, property } = _decorator;

@ccclass('BuildingPoint')
export class BuildingPoint extends Component {
    private choiceCount: number = 0
    private choiceOption: number = 0

    public build(st: string, isCurrentBuilding: boolean){
        tween(this.node.children[0].children[0].getComponent(UIOpacity))
        .call(() => {
            this.node.children[0].children[0].getComponent(Building).fadeOut()
        })
        .delay(1)
        .call(() => {
            this.init(st, isCurrentBuilding)
        })
        .start()
        return
    }

    public init(st: string, isCurrentBuilding: boolean, build: boolean = false){

        if(this.choiceCount != 0 && st == "0-1"){
             this.node.children[0].children[0].getComponent(Building).init(isCurrentBuilding, this, build)
             return
        }
        for(let c = 0; c < this.node.children[0].children.length; c++){
            this.node.children[0].children[0].destroy()
        }
        let indexOf: number = st.indexOf("-")
        this.choiceCount = parseInt(st.slice(0, indexOf))
        this.choiceOption = parseInt(st.slice(indexOf + 1, st.length))
        let bundle
        assetManager.loadBundle('Buildings', (err, load) => {
            bundle = load
            bundle.load(this.node.name + "-" + st, (err, asset) =>{
                let building: Node = instantiate(asset)
                building.parent = this.node.children[0]
                building.position = new Vec3(0,0,0)
                building.getComponent(Building).init(isCurrentBuilding, this, build)
            })
        });
    }
    public setChoice(){
        ChoiceManage.Instance.createChoice(this.node.name, this.choiceCount + 1, this)
    }
}