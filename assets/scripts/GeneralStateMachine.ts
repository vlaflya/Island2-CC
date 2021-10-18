
import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

let idCount = 0

@ccclass('GeneralStateMachine')
export class GeneralStateMachine{
    private id = (++idCount).toString()
    private context?: object

    constructor(context?: object, id?: string){
        this.id = id ?? this.id
        this.context = context
    }

    private states = new Map<string, IState>()
    private currentState?: IState
    private isChangingState = false

    isCurrentState(name: string){
        if(!this.currentState){
            return false
        }
        return this.currentState.name == name
    }

    addState(name: string, config?:{onEnter?: () => void, onUpdate?: (dt:number) => void, onExit?: () => void}){
        const context = this.context
        this.states.set(name,{
            name,
            onEnter: config?.onEnter?.bind(context),
            onUpdate : config?.onUpdate?.bind(context),
            onExit: config?.onExit?.bind(context),
        })
        return this
    }
    setState(name: string, arg?){
        if(!this.states.has(name)){
            console.warn(`Tried to change to unknown state: ${name}`);
            return
        }
        if(this.isCurrentState(name)){
            console.log("current")
            return
        }
        this.isChangingState = true
        this.currentState = this.states.get(name)
        if(this.currentState.onEnter){
            this.currentState.onEnter(arg)
        }
        this.isChangingState = false
    }
    exitState(arg?){
        this.currentState.onExit(arg)
    }
    update(dt: number){    
        if (this.currentState && this.currentState.onUpdate)
        {
            this.currentState.onUpdate(dt)
        }
    }
}
interface IState{
    name: string
    onEnter?: (arg?) => void
    onUpdate?: (dt: number) => void
    onExit?: (arg?) => void
}