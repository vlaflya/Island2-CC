
import { _decorator, Component, Node, sp, loader, assetManager, Sprite, ImageAsset, SpriteFrame, resources } from 'cc';
import { GameStateMachine } from './GameStateMachine';
import { ChoiceManage } from './ChoiceManage';
const { ccclass, property } = _decorator;

@ccclass('Building')
export class Building extends Component {
    @property({type: Node}) buildButton: Node
    @property({type: Sprite}) sprite: Sprite

    private choiceCount: number = 0
    private choiceOption: number = 0

    public initNoSave(isCurrentBuilding: boolean){
        this.init(this.choiceCount + "-" + this.choiceOption ,isCurrentBuilding )
    }

    public init(skinName: string, isCurrentBuilding: boolean){
        let spriteTmp: Sprite = this.sprite
        let indexOf: number = skinName.indexOf("-")
        this.choiceCount = parseInt(skinName.slice(0, indexOf))
        this.choiceOption = parseInt(skinName.slice(indexOf + 1, skinName.length))
        
        if(isCurrentBuilding)
            this.buildButton.active = true
        else
            this.buildButton.active = false
        if(this.choiceCount == 0)
            return        
        let bundle
        let path = this.node.name + '-' + skinName + '/spriteFrame'
        assetManager.loadBundle('Buildings', (err, load) => {
            bundle = load
            console.log(err);
            bundle.load(path, SpriteFrame, (err, asset) =>{
                console.log(asset);
                let sp: SpriteFrame = asset
                this.sprite.spriteFrame = asset
                console.log(err);
            })
        });
    }
    public setChoice(){
        console.log("oke")
        ChoiceManage.Instance.createChoice(this.node.name, this.choiceCount + 1, this)
    }
    public startBuild(){
        if(GameStateMachine.Instance.stateMachine.isCurrentState("idle")){
            GameStateMachine.Instance.exitIdle("choise")
        }
    }
}
