
import { _decorator, Component, Node, assetManager, instantiate, Vec3, tween, UIOpacity, Prefab, CCFloat, CCInteger } from 'cc';
import { Building } from './Building';
import { ChoiceManage } from './ChoiceManage';
import { SoundManager } from './SoundManager';
const { ccclass, property } = _decorator;

@ccclass('BuildingPoint')
export class BuildingPoint extends Component {
    @property({type: CCInteger}) maxBuildCount: number
    private choiceCount: number = 0
    private choiceOption: number = 0

    public build(st: string){
        tween(this.node.children[0].children[0].getComponent(UIOpacity))
        .delay(1)
        .call(() => {
            this.node.children[0].children[0].getComponent(Building).fadeOut()
        })
        .delay(2)
        .call(() => {
            this.init(st, false, true)
        })
        .start()
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
                if(building.getComponent(Building))
                    building.getComponent(Building).init(isCurrentBuilding, this, build)
            })
        });
    }
    public setNextMarker(){
        this.node.children[0].children[0].getComponent(Building).setNextMarker()
    }
    public setChoice(){
        ChoiceManage.Instance.createChoice(this.node.name, this)
    }
    public getCount(): number{
        return this.choiceCount
    }
    public getMaxBuildCount(): number{
        return this.maxBuildCount
    }
}