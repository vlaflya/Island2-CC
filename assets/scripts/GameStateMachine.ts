
import { _decorator, Component, Node, Game, JsonAsset, Asset } from 'cc';
import { GeneralStateMachine } from './GeneralStateMachine';
import { Bridge } from './Bridge';
import { BuildingManager } from './BuildingManager';
import { SoundManager } from './SoundManager';
const { ccclass, property } = _decorator;

@ccclass('GameStateMachine')
export class GameStateMachine extends Component {
    public stateMachine: GeneralStateMachine
    public static Instance: GameStateMachine

    start(){
        this.stateMachine = new GeneralStateMachine(this, "game")
        GameStateMachine.Instance = this
        this.stateMachine.addState("waitLoad", {onEnter: this.waitLoadEnter, onExit: this.waitLoadExit})
        .addState("idleState", {onEnter: this.idleStateEnter, onExit: this.idleStateExit})
        .addState("animationState", {onEnter: this.animationStateEnter, onExit: this.animationStateExit})
        .addState("choiseState", {onEnter: this.choiseStateEnter, onExit: this.choiseStateExit})
        this.stateMachine.setState("waitLoad")
    }
    nextDay(){
        if(this.stateMachine.isCurrentState("idleState"))
            this.stateMachine.setState("waitLoad")
    }
    //waitLoad
    private waitLoadEnter(){
        Bridge.Instance.loadSave()
    }
    public saveLoadded(asset: JsonAsset){
        this.stateMachine.exitState(asset)
    }
    private waitLoadExit(asset?: JsonAsset){
        BuildingManager.Instance.init()
        this.stateMachine.setState("idleState")
    }
    //idleState
    private idleStateEnter(asset?: JsonAsset){
        SoundManager.Instance.startTimer()
    }
    
    exitIdle(context: string){
        this.stateMachine.exitState(context)
    }
    private idleStateExit(context?: string){
        SoundManager.Instance.stopTimer()
        this.stateMachine.setState(context)
    }
    //animationState
    private animationStateEnter(){}
    private animationStateExit(){
        this.stateMachine.setState("idleState")
    }
    //choiseState
    private choiseStateEnter(){}
    public madeChoise(){
        this.stateMachine.exitState()
    }
    private choiseStateExit(){
        this.stateMachine.setState("idleState")
    }
}
