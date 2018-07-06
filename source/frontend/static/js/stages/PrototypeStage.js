// Import d3.js, crossfilter.js and dc.js.
// import * as d3 from "./static/lib/d3.v3";
// import * as crossfilter from "./static/lib/crossfilter.js";
// import * as dc from "./static/lib/dc.js";

// Import base class.
import Stage from './Stage.js'
import FilterReduceOperator from "../operators/FilterReduceOperator.js";
import SurrogateModelOperator from "../operators/SurrogateModelOperator.js";
import DissonanceOperator from "../operators/DissonanceOperator.js";
import Utils from "../Utils.js";
import DissonanceDataset from "../data/DissonanceDataset.js";

/**
 * Stage for prototype (2018-02).
 */
export default class PrototypeStage extends Stage
{
    /**
     *
     * @param name
     * @param target ID of container div.
     * @param datasets Dictionary of isnstance of dataset class.
     */
    constructor(name, target, datasets)
    {
        super(name, target, datasets);

        // Construct operators.
        this.constructOperators()
    }

    /**
     * Construct all panels for this view.
     */
    constructOperators()
    {
        let scope = this;

        // Fetch (test) dataset for surrogate model first, then initialize panels.
        let surrModelJSON = fetch(
            "/get_surrogate_model_data?modeltype=tree&objs=r_nx,b_nx&depth=10",
            {
                headers: { "Content-Type": "application/json; charset=utf-8"},
                method: "GET"
            }
        ).then(res => res.json());

        let dissonanceDataJSON = fetch(
            "/get_sample_dissonance",
            {
                headers: { "Content-Type": "application/json; charset=utf-8"},
                method: "GET"
            }
        ).then(res => res.json());

        // Fetch data.
        Promise.all([surrModelJSON, dissonanceDataJSON])
            .then(function(values) {
                scope._datasets["surrogateModel"]   = values[0];
                scope._datasets["dissonance"]       = new DissonanceDataset("Dissonance Dataset", values[1]);

                // For panels at bottom: Spawn container.
                let splitTopDiv = Utils.spawnChildDiv(scope._target, null, "split-top-container");
                // For panels at bottom: Spawn container. Used for surrogate and dissonance panel.
                let splitBottomDiv = Utils.spawnChildDiv(scope._target, null, "split-bottom-container");

                //---------------------------------------------------------
                // 1. Operator for hyperparameter and objective selection.
                // ---------------------------------------------------------

                scope._operators["FilterReduce"] = new FilterReduceOperator(
                    "FilterReduce:TSNE",
                    scope,
                    scope._datasets["modelMetadata"],
                    splitTopDiv.id
                );

                // ---------------------------------------------------------
                // 2. Operator for exploration of surrogate model (read-only).
                // ---------------------------------------------------------

                scope._operators["SurrogateModel"] = new SurrogateModelOperator(
                    "GlobalSurrogateModel:DecisionTree",
                    scope,
                    scope._datasets["surrogateModel"],
                    "Tree",
                    splitBottomDiv.id
                );

                // ---------------------------------------------------------
                // 3. Operator for exploration of inter-model disagreement.
                // ---------------------------------------------------------

                scope._datasets["dissonance"] = scope._datasets["modelMetadata"];

                scope._operators["Dissonance"] = new DissonanceOperator(
                    "GlobalSurrogateModel:DecisionTree",
                    scope,
                    scope._datasets["dissonance"],
                    splitBottomDiv.id
                );

                // ---------------------------------------------------------
                // 4. Initialize split panes.
                // ---------------------------------------------------------

                // Horizontal split.
                let surrTarget = scope._operators["SurrogateModel"]._target;
                let dissTarget = scope._operators["Dissonance"]._target;
                $("#" + surrTarget).addClass("split split-horizontal");
                $("#" + dissTarget).addClass("split split-horizontal");
                Split(["#" + surrTarget, "#" + dissTarget], {
                    direction: "horizontal",
                    sizes: [50, 50],
                    onDragEnd: function() {

                    }
                });

                // Vertical split.
                $("#" + splitTopDiv.id).addClass("split split-vertical");
                $("#" + splitBottomDiv.id).addClass("split split-vertical");
                Split(["#" + splitTopDiv.id, "#" + splitBottomDiv.id], {
                    direction: "vertical",
                    sizes: [53, 47],
                    onDragEnd: function() {
                    }
                });

                // After split: Render (resize-sensitive) charts.
                scope._operators["SurrogateModel"].render();
                scope._operators["Dissonance"].render();
            });
    }
}