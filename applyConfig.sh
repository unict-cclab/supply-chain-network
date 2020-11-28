source ./config.sh

if [ ! -d "$K8S" ]; then
  mkdir -p $K8S
  cp -a k8s-templates/. $K8S

  for file in $(find "$K8S" -name "*.yaml" -type f); do
    envsubst <$file >$file.tmp && mv $file.tmp $file
  done

  for file in $(find "$K8S" -name "*.properties" -type f); do
    envsubst <$file >$file.tmp && mv $file.tmp $file
  done
fi
