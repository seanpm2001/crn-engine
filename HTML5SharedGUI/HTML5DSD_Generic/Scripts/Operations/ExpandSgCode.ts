// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as $ from 'jquery';
import * as crnVM from "../../../CRNComponent/Scripts/crnVM";
import * as serialization from "../../../../CRNEngine/CRNEngineTSWrapper/Scripts/Interfaces";
import * as HintScreen from "../../../../HTML5SharedGUI/GenericComponents/Scripts//HintScreen";
import * as Operations from "../../../../HTML5SharedGUI/HTML5CRN_Lib/Scripts/Operations/LongOperations";
import * as GenericParsing from "../../../../HTML5SharedGUI/HTML5CRN_Lib/Scripts/Operations/GenericCodeParsing";
import * as CRNParsing from "../../../../HTML5SharedGUI/HTML5CRN_Lib/Scripts/Operations/ParseCodeFillCRN";
import * as ExpanderParser from "../Adapters/GenericExpandingParser";

//shows the crn code that is produced by StrandGraphs translation
export interface ICodeViewer {
    ShowCode(code: string): void;
    ClearModificationIndicator(): void;
}

export interface IParsed<TCustomSettings> {
    model: serialization.IG,
    customSettings: TCustomSettings,
    code: string
}

export interface IModelSource<TCustomSettings> {
    getModel(): serialization.IG;
    getSettings(): TCustomSettings;
}

//End of dependencies to be injected

export class Operation<TCustomSettings, TOptions> extends GenericParsing.Operation<IParsed<TCustomSettings>, TOptions> implements Operations.IOperation, HintScreen.IHintRemoveNotifier {
    constructor(codeSource: GenericParsing.ICodeSource<TOptions>,
        private crnCodeViewer: ICodeViewer,
        private modelSource: IModelSource<TCustomSettings>,
        private eparser: ExpanderParser.ExpandingParser<TCustomSettings, TOptions>,
        private crnViewer: CRNParsing.IModelViewer<TCustomSettings>,
        errorDisplay: GenericParsing.IErrorDisplay) {
        super(codeSource, eparser, errorDisplay);
    }

    //defining abstract functions
    public GetName() {
        return "DSD model expansion";
    }

    public Initiate(): JQueryPromise<any> {
        var ig = this.modelSource.getModel();
        this.eparser.SetCurrentState(ig, this.modelSource.getSettings());
        return super.Initiate();
    }

    protected InterpretSuccessfulResults(data: IParsed<TCustomSettings>) {
        this.crnViewer.UpdateValuesWith(data.model, data.customSettings, false);
        this.crnCodeViewer.ShowCode(data.code);
        this.crnCodeViewer.ClearModificationIndicator();
        this.notificationCallbacks.forEach(c => { c() }); // notifing that hints now can be removed
    }

    //HintScreen.IHintRemoveNotifier implementation
    private notificationCallbacks: Array<() => void> = [];
    public SubscribeRemoveHint(callback: () => void) {
        this.notificationCallbacks.push(callback);
    }
}
