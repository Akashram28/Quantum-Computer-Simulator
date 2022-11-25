import numpy as np
import matplotlib.pyplot as plt
import itertools
import random

gates = {
    'h'  : np.array([[1/np.sqrt(2),1/np.sqrt(2)] , [1/np.sqrt(2),-1/np.sqrt(2)]]),
    'cn' : np.array([[1,0,0,0], [0,1,0,0] , [0,0,0,1] , [0,0,1,0]]),
    'icn': np.array([[1,0,0,0] , [0,0,0,1] , [0,0,1,0], [0,1,0,0]]),
    'x'  : np.array([[0,1] , [1,0]]),
    'z'  : np.array([[1,0] , [0,-1]]),
    'sw' : np.array([[1,0,0,0] , [0,0,1,0] , [0,1,0,0] , [0,0,0,1]]),
    's'  : np.array([[1,0] , [0, 1j]]),
    't'  : np.array([[1,0] , [0 , np.exp((1j*np.pi)/4 )]]),
    'cz' : np.array([[1,0,0,0], [0,1,0,0] , [0,0,1 ,0] , [0,0,0,-1]]),
    'icz': np.array([[1,0,0,0], [0,1,0,0] , [0,0,1 ,0] , [0,0,0,-1]]),
    'y'  : np.array([[0,-1j] , [1j,0]]),
    'i'  : np.array([[1,0] , [0,1]])
}

qcircuit = []
# qreg_no = int(input('Enter number of qubits : '))
# creg_no = int(input('Enter number of classical bits : '))

qreg_no,creg_no = 3, 2 # TEMPORARY

for i in range(qreg_no):
    qcircuit.append(['i'])

while True:
    cmd = input("Enter command : ")
    if cmd == 'end':
        break
    gate , reg_no , pos = cmd.split(',')
    reg_no = int(reg_no)
    pos = int(pos)
    #------------ Preprocessing -------------#
    if gate not in gates.keys():
        print('Invalid Gate.')
        continue
    if reg_no >= qreg_no:
        print('Register number is too big.')
        continue
    if ((gate == 'cn' or gate == 'cz' or gate == 'sw') and reg_no == 0) or ((gate == 'icn' or gate== 'icz') and reg_no == qreg_no-1):
        print('This gate cannot be applied at this register.')
        continue
    if pos >= len(qcircuit[reg_no]):
        pos = len(qcircuit[reg_no]) 
    if pos < len(qcircuit[reg_no]):
        qcircuit[reg_no][pos] = gate
    else:
        qcircuit[reg_no].append(gate)
    
    for i in qcircuit:
        if len(i) < len(qcircuit[reg_no]):
            i.append('i')

    if gate == 'cn' or gate == 'cz' or gate == 'sw':
        qcircuit[reg_no-1][pos] = 'i'
    elif gate == 'icn' or gate == 'icz':
        qcircuit[reg_no+1][pos] = 'i'
    else:
        if reg_no != qreg_no-1 and(qcircuit[reg_no+1][pos] == 'cn' or qcircuit[reg_no+1][pos] == 'cz' or qcircuit[reg_no+1][pos] == 'sw'):
            qcircuit[reg_no+1][pos] = 'i'
        if reg_no != 0 and(qcircuit[reg_no-1][pos] == 'icn' or qcircuit[reg_no-1][pos] == 'icz'):
            qcircuit[reg_no-1][pos] = 'i'

    #----------------------------------------#
                
    print(qcircuit)

qcircuit = np.array(qcircuit)
print(qcircuit)

column_matrix = []


for i in range(len(qcircuit[0])):
    tensor_product = 'temp'
    for j in range(len(qcircuit)):
        if (j != len(qcircuit) - 1 and (qcircuit[j + 1][i] == 'cn' or qcircuit[j + 1][i] == 'cz' or qcircuit[j + 1][i] == 'sw')) or (j != 0 and (qcircuit[j-1][i] == 'icn' or qcircuit[j-1][i] == 'icz')):
            continue
        if type(tensor_product) == str:
            tensor_product = gates.get(qcircuit[j][i])
            continue
        else:
            tensor_product = np.kron(tensor_product,gates.get(qcircuit[j][i]))
    
    column_matrix.append(tensor_product)
# print(column_matrix)
circuit_matrix = 'temp'

for i in range(len(column_matrix)):
    if i == 0:
       circuit_matrix = column_matrix[i]
    else:
        circuit_matrix = np.dot(circuit_matrix , column_matrix[i])



input_vector = np.array([1,0])
for i in range(qreg_no -1):
    input_vector = np.kron(input_vector , np.array([1,0]) )


output_vector = np.tensordot(input_vector,circuit_matrix,axes = 1)


probability_amplitudes = [round(i*i , 2) for i in output_vector]


output_names = [''.join(i) for i in itertools.product(['0', '1'], repeat=qreg_no)]

shots = int(input("Enter number of shots : "))
def measure_probability(probability_amplitudes = probability_amplitudes , shots = shots , output_names = output_names):
    counts = [0 for i in range(len(probability_amplitudes))]

    for i in range(shots):
        measured_value=random.choices(output_names, weights=(probability_amplitudes))
        counts[output_names.index(measured_value[0])] +=1

        
    
    result = dict(zip(output_names, counts))
    return result

def addlabels(x,y):
    for i in range(len(x)):
        plt.text(i,y[i],y[i])


print(probability_amplitudes)
result = measure_probability()
plt.bar(range(len(result)), list(result.values()), align='center')
plt.xticks(range(len(result)), list(result.keys()))
addlabels(list(result.keys()),list(result.values()))
plt.show()

