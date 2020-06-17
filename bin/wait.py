import subprocess, argparse, yaml
from yaml import load, dump
from time import sleep

def exec_kubectl(args):
    ap = args[:0] + ['kubectl'] + args[0:]
    p = subprocess.run(ap, stdout=subprocess.PIPE)
    return p.stdout    

parser = argparse.ArgumentParser(description="Wait for all containers in a pod to be running")
parser.add_argument('-n', '--namespace', type=str, default='default', required=False)
parser.add_argument('-c', '--item_count', type=int, required=True)
parser.add_argument('-l', '--selector', type=str, required=False)
args = parser.parse_args()
done = 0
ctr = 0
while not done:
    if args.selector:
        pods = load(exec_kubectl(['get', 'pods', '-l', args.selector, '-o', 'yaml','-n', args.namespace]), Loader=yaml.FullLoader)
    else:
        pods = load(exec_kubectl(['get', 'pods', '-o', 'yaml','-n', args.namespace]), Loader=yaml.FullLoader)

    ready_items = [item for item in pods.get('items')
                    if len([c for c in item['status']['conditions']
                        if c.get('type') == 'Ready' and c.get('status') == 'True'])]
    
    if len(ready_items) >= args.item_count:
        done = 1

    sleep(1) # don't thrash the CPU