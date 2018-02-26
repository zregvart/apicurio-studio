/**
 * @license
 * Copyright 2017 JBoss Inc
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {Component, EventEmitter, Input, Output, ViewEncapsulation} from "@angular/core";
import {Subject} from "rxjs/Subject";
import {Subscription} from "rxjs/Subscription";
import 'codemirror/mode/javascript/javascript';
import 'codemirror/mode/markdown/markdown';
import 'codemirror/mode/yaml/yaml';
import {CodemirrorService} from "@nomadreservations/ngx-codemirror";

export enum CodeEditorTheme {
    Light, Dark
}

export enum CodeEditorMode {
    Text, JSON, YAML, Markdown
}


@Component({
    moduleId: module.id,
    selector: "code-editor",
    templateUrl: "code-editor.component.html",
    encapsulation: ViewEncapsulation.None
})
export class CodeEditorComponent {

    private static DEFAULT_DEBOUNCE_TIME: number = 200;

    public _textValue: string;
    public _textValueDebouncer: Subject<string> = new Subject<string>();
    public _debounceTime: number;
    public _debouncerSubscription: Subscription;

    private _editor: any;

    @Input() theme: CodeEditorTheme;
    _mode: CodeEditorMode;

    @Input()
    get text() {
        return this._textValue;
    }

    @Output() public textChange = new EventEmitter<string>();
    set text(value: string) {
        console.info("Setting TEXT");
        this._textValue = value;
        this._textValueDebouncer.next(this._textValue);
    }

    @Input()
    get debounceTime() {
        return this._debounceTime;
    }
    set debounceTime(time: number) {
        console.info("Setting DEBOUNCE to: ", time);
        this._debounceTime = time;
        let bounce: number = this._debounceTime;
        if (!bounce) {
            bounce = CodeEditorComponent.DEFAULT_DEBOUNCE_TIME;
        }
        if (this._debouncerSubscription) {
            this._debouncerSubscription.unsubscribe();
        }
        this._debouncerSubscription = this._textValueDebouncer.debounceTime(bounce).subscribe( value => {
            this.textChange.emit(value);
        })
    }

    @Input()
    get mode() {
        return this._mode;
    }
    set mode(newMode: CodeEditorMode) {
        this._mode = newMode;
        if (this._editor) {
            console.info("Setting MODE");
            // This should be the CM editor
            if (this._mode === CodeEditorMode.JSON) {
                this._editor.setOption("mode", "application/json");
            } else if (this._mode === CodeEditorMode.YAML) {
                this._editor.setOption("mode", "text/x-yaml");
            } else if (this._mode === CodeEditorMode.Markdown) {
                this._editor.setOption("mode", "text/x-markdown");
            } else {
                this._editor.setOption("mode", "text");
            }
        }
    }

    /**
     * C'tor.
     * @param {CodemirrorService} _codeMirror
     */
    constructor(private _codeMirror: CodemirrorService) {
        this._debouncerSubscription = this._textValueDebouncer.debounceTime(CodeEditorComponent.DEFAULT_DEBOUNCE_TIME).subscribe( value => {
            console.info("Firing text-change msg");
            this.textChange.emit(value);
        });
        this._codeMirror.instance$.subscribe((editor) => {
            this._editor = editor;
        });
    }

    public cmOptions(): any {
        console.info("Returning standard CM options.");
        let config: any = {
            lineNumbers: true,
            theme: "default",
            mode: "text/plain"
        };
        if (this.mode === CodeEditorMode.YAML) {
            config.mode = "text/x-yaml";
        }
        if (this.mode === CodeEditorMode.JSON) {
            config.mode = "application/json";
        }
        if (this.mode === CodeEditorMode.Markdown) {
            config.mode = "text/x-markdown";
        }
        return config;
    }
}
