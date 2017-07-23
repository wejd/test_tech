import hashlib
import sys
hash_object = hashlib.sha1(sys.argv[1].encode())
print(hash_object);