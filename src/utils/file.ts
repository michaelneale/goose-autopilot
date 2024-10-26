import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as yaml from 'yaml';

export interface PlanFile {
    kickoff_message: string;
    tasks: string[];
}

export function createPlanYaml(instructions: string): string {
    // Create tmp directory if it doesn't exist
    const tmpDir = path.join(os.tmpdir(), 'goose-autopilot');
    if (!fs.existsSync(tmpDir)) {
        fs.mkdirSync(tmpDir, { recursive: true });
    }

    // Create plan object
    const plan: PlanFile = {
        kickoff_message: "goose is starting",
        tasks: instructions.split('\n').filter(line => line.trim() !== '')
    };

    // Create plan.yaml file
    const planPath = path.join(tmpDir, 'plan.yaml');
    fs.writeFileSync(planPath, yaml.stringify(plan));

    return planPath;
}