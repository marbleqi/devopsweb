FROM centos:7 AS build

RUN ln -sf /usr/share/zoneinfo/Asia/Shanghai /etc/localtime && yum install -y epel-release && yum -y update

WORKDIR /data

RUN curl --silent --location https://rpm.nodesource.com/setup_14.x | bash - \
  && yum install -y nodejs python3 make gcc gcc-c++ \
  && npm config set registry https://registry.npmmirror.com \
  && npm config set sass_binary_site=https://npmmirror.com/mirrors/node-sass/ \
  && npm i -g npm \
  && npm i -g yarn \
  && yarn config set registry https://registry.npmmirror.com -g \
  && yarn config set sass_binary_site http://cdn.npmmirror.com/dist/node-sass -g

COPY . .
RUN yarn && yarn run color-less && yarn run build

FROM nginx
RUN ln -sf /usr/share/zoneinfo/Asia/Shanghai /etc/localtime \
  && mkdir -p /data/html
COPY nginx.conf /etc/nginx/
COPY --from=build /data/dist/html /data/html
